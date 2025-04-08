import { observable } from "@legendapp/state";
import * as SQLite from "expo-sqlite";
import supabase from "../app/supabaseClient";
import { Alert } from "react-native";

// For generating UUIDs
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

// CREATE LEGEND-STATE STORE
export const store = observable({
  households: [],
  mealPatterns: [],
  addmember: [],
  memberhealthinfo: [],
  immunization: [],
  synced: false, // Tracks sync status
});

let db = null;

/**
 * OPEN DATABASE
 */
export const openDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("nutrifile.db");
    console.log("✅ Database opened successfully.");
    //await resetLocalDatabase();

  }
  return db;
};

/**
 * RESET LOCAL DATABASE
 * Drops all local tables, recreates them, and resets the store.
 */
export const resetLocalDatabase = async () => {
  const database = await openDatabase();
  try {
    console.log("🗑️ Dropping and recreating local database...");

    // Drop tables if they exist
    await database.runAsync("DROP TABLE IF EXISTS immunization;");
    await database.runAsync("DROP TABLE IF EXISTS memberhealthinfo;");
    await database.runAsync("DROP TABLE IF EXISTS addmember;");
    await database.runAsync("DROP TABLE IF EXISTS mealpattern;");
    await database.runAsync("DROP TABLE IF EXISTS household;");

    // Recreate tables
    await createTables();

    // Reset Legend-State store
    store.households.set([]);
    store.mealPatterns.set([]);
    store.addmember.set([]);
    store.memberhealthinfo.set([]);
    store.immunization.set([]);
    store.synced.set(false);

    console.log("✅ Local database and Legend-State store reset.");
  } catch (error) {
    
    console.error("❌ Error resetting local database:", error);
  }
};

/**
 * CREATE TABLES
 * Uses only UUID-based keys and references.
 */
export const createTables = async () => {
  const database = await openDatabase();
  console.log("🚀 Ensuring tables exist with UUID-based schema...");

  // Household table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS household (
      uuid TEXT PRIMARY KEY,
      district TEXT,
      barangay TEXT,
      sitio TEXT,
      householdnumber TEXT NOT NULL,
      dateofvisit TEXT,
      toilet TEXT,
      sourceofwater TEXT,
      sourceofincome TEXT,
      foodproductionvegetable TEXT,
      foodproductionanimals TEXT,
      membership4ps TEXT,
      synced INTEGER DEFAULT 0
    );
  `);

  // Meal Pattern table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS mealpattern (
      uuid TEXT PRIMARY KEY,
      household_uuid TEXT,
      breakfast TEXT,
      lunch TEXT,
      dinner TEXT,
      foodbelief TEXT,
      healthconsideration TEXT,
      whatifsick TEXT,
      checkupfrequency TEXT,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (household_uuid) REFERENCES household(uuid) ON DELETE CASCADE
    );
  `);

  // addmember table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS addmember (
      uuid TEXT PRIMARY KEY,
      firstname TEXT,
      lastname TEXT,
      relationship TEXT,
      sex TEXT,
      dateofbirth DATE,
      age TEXT,
      classification TEXT,
      healthrisk TEXT,
      weight FLOAT,
      height FLOAT,
      educationallevel TEXT,
      household_uuid TEXT,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (household_uuid) REFERENCES household(uuid) ON DELETE CASCADE
    );
  `);

  // Member Health Info table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS memberhealthinfo (
      uuid TEXT PRIMARY KEY,
      member_uuid TEXT,
      philhealth TEXT,
      familyplanning TEXT,
      lastmenstrualperiod TEXT,
      smoker TEXT,
      alcoholdrinker TEXT,
      physicalactivity TEXT,
      morbidity TEXT,
      household_uuid TEXT,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (member_uuid) REFERENCES addmember(uuid) ON DELETE CASCADE,
      FOREIGN KEY (household_uuid) REFERENCES household(uuid) ON DELETE CASCADE
    );
  `);

  // Immunization table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS immunization (
      uuid TEXT PRIMARY KEY,
      member_uuid TEXT,
      bcg TEXT,
      hepatitis TEXT,
      pentavalent TEXT,
      oralpolio TEXT,
      pneumococcal TEXT,
      mmr TEXT,
      remarks TEXT,
      household_uuid TEXT,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (member_uuid) REFERENCES addmember(uuid) ON DELETE CASCADE,
      FOREIGN KEY (household_uuid) REFERENCES household(uuid) ON DELETE CASCADE
    );
  `);

  console.log("✅ Tables are ready with UUID-based primary keys.");
};

/**
 * GET UNSYNCED DATA
 */
export async function getUnsyncedData() {
  const db = await openDatabase();

  const households = await db.getAllAsync(`SELECT * FROM household WHERE synced = 0`);
  const members = await db.getAllAsync(`SELECT * FROM addmember WHERE synced = 0`);
  const mealPatterns = await db.getAllAsync(`SELECT * FROM mealpattern WHERE synced = 0`);
  const healthInfo = await db.getAllAsync(`SELECT * FROM memberhealthinfo WHERE synced = 0`);
  const immunizations = await db.getAllAsync(`SELECT * FROM immunization WHERE synced = 0`);

  return { households, members, mealPatterns, healthInfo, immunizations };
}

/* -------------------------------------------------------------------------- */
/*                               INSERT FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

/**
 * Insert Household (OFFLINE FIRST)
 */
export const insertHousehold = async (data) => {
  const db = await openDatabase();

  // Basic validation
  if (!data.householdnumber || data.householdnumber.trim() === "") {
    Alert.alert("Missing Info", "Household number is required.");
    return null;
  }

  // Check for duplicates by householdnumber
  const existing = await db.getFirstAsync(
    `SELECT uuid FROM household WHERE householdnumber = ? LIMIT 1;`,
    [data.householdnumber]
  );
  if (existing) {
    Alert.alert("Duplicate Entry", `Household #${data.householdnumber} already exists locally.`);
    return existing.uuid;
  }

  // Generate a brand-new UUID
  const newUuid = uuidv4();

  console.log("📌 Inserting new household locally with uuid:", newUuid);
  try {
    await db.runAsync(
      `INSERT INTO household (
        uuid, district, barangay, sitio, householdnumber, dateofvisit,
        toilet, sourceofwater, sourceofincome, foodproductionvegetable,
        foodproductionanimals, membership4ps, synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
      [
        newUuid,
        data.district,
        data.barangay,
        data.sitio,
        data.householdnumber,
        data.dateofvisit,
        data.toilet,
        data.sourceofwater,
        data.sourceofincome,
        data.foodproductionvegetable,
        data.foodproductionanimals,
        data.membership4ps,
      ]
    );

    Alert.alert("Success", "Household saved locally (offline).");
    return newUuid;
  } catch (error) {
    console.error("❌ Error inserting household:", error);
    Alert.alert("Error", "Something went wrong while saving data.");
    return null;
  }
};

/**
 * Insert Meal Pattern (OFFLINE FIRST)
 * @param {string} householdUuid The parent's household uuid
 * @param {object} data The meal pattern form
 */
export const insertMealPattern = async (householdUuid, data) => {
  const db = await openDatabase();

  if (!householdUuid) {
    console.error("❌ Cannot insert meal pattern: householdUuid is missing.");
    return false;
  }

  // Generate a brand-new UUID for the meal pattern
  const newUuid = uuidv4();

  console.log("📌 Attempting to insert Meal Pattern with uuid:", newUuid);
  try {
    await db.runAsync(
      `INSERT INTO mealpattern (
         uuid, household_uuid, breakfast, lunch, dinner, foodbelief,
         healthconsideration, whatifsick, checkupfrequency, synced
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
      [
        newUuid,
        householdUuid,
        data.breakfast,
        data.lunch,
        data.dinner,
        data.foodbelief,
        data.healthconsideration,
        data.whatifsick,
        data.checkupfrequency,
      ]
    );
    Alert.alert("Success", "Meal pattern saved locally.");
    return true;
  } catch (error) {
    console.error("❌ Error inserting meal pattern data:", error);
    return false;
  }
};

/**
 * Insert Member (OFFLINE FIRST)
 * @param {object} data
 */
export const insertMember = async (data) => {
  const db = await openDatabase();

  // If household_uuid isn't provided, fall back to householdid (but ideally, this should be a UUID)
  const householdUuid = data.household_uuid || data.householdid;
  if (!data.firstname || !data.lastname || !householdUuid) {
    console.error("❌ Cannot insert member: Missing required fields (firstname/lastname/household_uuid).");
    return null;
  }
  // Validate and parse date...
  if (!data.dateofbirth || isNaN(Date.parse(data.dateofbirth))) {
    console.error("❌ Invalid date format for dateofbirth:", data.dateofbirth);
    return null;
  }
  // Convert empty strings to NULL for weight/height
  const weightValue =
    data.weight && !isNaN(parseFloat(data.weight)) ? parseFloat(data.weight) : null;
  const heightValue =
    data.height && !isNaN(parseFloat(data.height)) ? parseFloat(data.height) : null;

  // Generate a new UUID for the member
  const newUuid = uuidv4();

  try {
    await db.runAsync(
      `INSERT INTO addmember (
        uuid, household_uuid, firstname, lastname, relationship,
        sex, dateofbirth, classification, healthrisk, weight,
        height, educationallevel, synced
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
      [
        newUuid,
        householdUuid, // Use the resolved household UUID
        data.firstname,
        data.lastname,
        data.relationship,
        data.sex,
        data.dateofbirth,
        data.classification,
        data.healthrisk || "",
        weightValue,
        heightValue,
        data.educationallevel,
      ]
    );

    Alert.alert("Success", "Member saved locally (offline).");
    return newUuid;
  } catch (error) {
    console.error("❌ Error inserting member data:", error);
    return null;
  }
};


/**
 * Update Member
 * @param {string} memberUuid
 * @param {object} data
 */
export const updateMember = async (memberUuid, data) => {
  const db = await openDatabase();
  if (!memberUuid) {
    console.error("❌ Cannot update member: missing memberUuid");
    return null;
  }
  try {
    const fields = [];
    const values = [];
    for (const key in data) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
    // Mark record unsynced
    fields.push("synced = 0");

    values.push(memberUuid);
    const query = `UPDATE addmember SET ${fields.join(", ")} WHERE uuid = ?;`;
    await db.runAsync(query, values);

    console.log("✅ updateMember: record updated for uuid:", memberUuid);
    return memberUuid;
  } catch (error) {
    console.error("❌ Error updating member:", error);
    return null;
  }
};

/**
 * Update Member Data
 * Just a more specialized version if needed
 */
export const updateMemberData = async (memberUuid, updatedData) => {
  const db = await openDatabase();
  if (!memberUuid) {
    console.error("❌ Cannot update: missing memberUuid");
    return { success: false };
  }
  try {
    console.log("🛠 Updating member with UUID:", memberUuid);
    const fields = Object.keys(updatedData)
      .filter((key) => updatedData[key] !== undefined)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updatedData).filter((v) => v !== undefined);
    values.push(memberUuid);

    if (fields.length === 0) {
      console.warn("⚠️ No fields to update.");
      return { success: false, message: "No fields to update" };
    }

    const query = `UPDATE addmember SET ${fields}, synced = 0 WHERE uuid = ?;`;
    await db.runAsync(query, values);

    console.log("✅ Local DB updated for member:", memberUuid);
    Alert.alert("Success", "Local update complete. Please sync to push changes.");
    return { success: true };
  } catch (error) {
    console.error("❌ Error updating member data:", error);
    return { success: false, message: error.message };
  }
};
/**
 * Insert Member Health Info – storing health data separately
 */
export const insertMemberHealthInfo = async (data) => {
  const db = await openDatabase();

  // Use member_uuid from data; if missing, log error.
  if (!data.member_uuid || typeof data.member_uuid !== "string" || data.member_uuid.length < 30) {
    console.error("❌ Cannot insert health info: missing or invalid member_uuid.");
    return null;
  }
  // Also ensure household_uuid is valid
  if (!data.household_uuid || typeof data.household_uuid !== "string" || data.household_uuid.length < 30) {
    console.error("❌ Cannot insert health info: missing or invalid household_uuid.");
    return null;
  }
  const newUuid = uuidv4();
  console.log("📌 Inserting new member health info with uuid:", newUuid);
  try {
    await db.runAsync(
      `INSERT INTO memberhealthinfo (
        uuid, member_uuid, philhealth, familyplanning, lastmenstrualperiod,
        smoker, alcoholdrinker, physicalactivity, morbidity,
        household_uuid, synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
      [
        newUuid,
        data.member_uuid,
        data.philhealth || "No",
        data.familyplanning || "No",
        data.lastmenstrualperiod || null,
        data.smoker || "No",
        data.alcoholdrinker || "No",
        data.physicalactivity || "No",
        data.morbidity || "Absence",
        data.household_uuid,
      ]
    );
    Alert.alert("Success", "Member health info saved locally.");
    return newUuid;
  } catch (error) {
    console.error("❌ Error inserting member health info:", error);
    return null;
  }
};



/**
 * Insert Immunization
 */
export const insertImmunization = async (data) => {
  const db = await openDatabase();
  if (!data.member_uuid) {
    console.error("❌ Cannot insert immunization: missing member_uuid.");
    return null;
  }
  const newUuid = uuidv4();

  console.log("📌 Inserting immunization data with uuid:", newUuid);
  try {
    await db.runAsync(
      `INSERT INTO immunization (
        uuid, member_uuid, bcg, hepatitis, pentavalent,
        oralpolio, pneumococcal, mmr, remarks, household_uuid, synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
      [
        newUuid,
        data.member_uuid,
        data.bcg,
        data.hepatitis,
        data.pentavalent,
        data.oralpolio,
        data.pneumococcal,
        data.mmr,
        data.remarks,
        data.household_uuid,
      ]
    );
    Alert.alert("Success", "Immunization data saved locally.");
    return newUuid;
  } catch (error) {
    console.error("❌ Error inserting immunization data:", error);
    return null;
  }
};

/* -------------------------------------------------------------------------- */
/*                              SYNC WITH SUPABASE                             */
/* -------------------------------------------------------------------------- */

export const syncWithSupabase = async () => {
  const db = await openDatabase();
  try {
    // 1) Households
    console.log("🔎 Checking for unsynced households...");
    const unsyncedHouseholds = await db.getAllAsync("SELECT * FROM household WHERE synced = 0");

    for (const household of unsyncedHouseholds) {
      console.log("🚀 Syncing household:", household.uuid);
      const { data, error } = await supabase
        .from("household")
        .upsert(
          [
            {
              uuid: household.uuid,
              district: household.district,
              barangay: household.barangay,
              sitio: household.sitio,
              householdnumber: household.householdnumber,
              dateofvisit: household.dateofvisit,
              toilet: household.toilet,
              sourceofwater: household.sourceofwater,
              sourceofincome: household.sourceofincome,
              foodproductionvegetable: household.foodproductionvegetable,
              foodproductionanimals: household.foodproductionanimals,
              membership4ps: household.membership4ps,
            },
          ],
          { onConflict: "uuid" }
        )
        .maybeSingle();

      if (error) {
        console.error("❌ Error inserting household:", error.message);
      } else if (data) {
        
        console.log(`✅ Household synced with uuid: ${household.uuid}`);
        await db.runAsync("UPDATE household SET synced = 1 WHERE uuid = ?;", [household.uuid]);
      }
    }

    // 2) Members
    console.log("🔎 Checking for unsynced members...");
    const unsyncedMembers = await db.getAllAsync("SELECT * FROM addmember WHERE synced = 0");
    for (const member of unsyncedMembers) {
      console.log("🚀 Syncing member:", member.uuid);
      const { data, error } = await supabase
        .from("addmember")
        .upsert(
          [
            {
              uuid: member.uuid,
              household_uuid: member.household_uuid,
              firstname: member.firstname,
              lastname: member.lastname,
              relationship: member.relationship,
              sex: member.sex,
              dateofbirth: member.dateofbirth,
              classification: member.classification,
              healthrisk: member.healthrisk,
              weight: member.weight,
              height: member.height,
              educationallevel: member.educationallevel,
            },
          ],
          { onConflict: "uuid" }
        )
        .single();
      if (!error && data) {
        console.log(`✅ Member synced with uuid: ${member.uuid}`);
        await db.runAsync("UPDATE addmember SET synced = 1 WHERE uuid = ?;", [member.uuid]);
      } else {
        console.error("❌ Error syncing member:", error?.message || "Unknown error");
      }
    }

    // 3) Meal Patterns
    console.log("🔎 Checking for unsynced meal patterns...");
    const unsyncedMealPatterns = await db.getAllAsync(
      "SELECT * FROM mealpattern WHERE synced = 0"
    );
    for (const mp of unsyncedMealPatterns) {
      console.log("🚀 Syncing meal pattern:", mp.uuid);
      const { data, error } = await supabase
        .from("mealpattern")
        .upsert(
          [
            {
              uuid: mp.uuid,
              household_uuid: mp.household_uuid,
              breakfast: mp.breakfast,
              lunch: mp.lunch,
              dinner: mp.dinner,
              foodbelief: mp.foodbelief,
              healthconsideration: mp.healthconsideration,
              whatifsick: mp.whatifsick,
              checkupfrequency: mp.checkupfrequency,
            },
          ],
          { onConflict: "uuid" }
        )
        .single();

      if (!error && data) {
        console.log(`✅ Meal Pattern synced with uuid: ${mp.uuid}`);
        await db.runAsync("UPDATE mealpattern SET synced = 1 WHERE uuid = ?;", [mp.uuid]);
      } else {
        console.error("❌ Error inserting meal pattern:", error?.message || "Unknown error");
      }
    }

    // 4) Member Health Info
    console.log("🔎 Checking for unsynced member health info...");
    const unsyncedHealth = await db.getAllAsync(
      "SELECT * FROM memberhealthinfo WHERE synced = 0"
    );
    for (const mh of unsyncedHealth) {
      console.log("🚀 Syncing member health info:", mh.uuid);
      const { data, error } = await supabase
        .from("memberhealthinfo")
        .upsert(
          [
            {
              uuid: mh.uuid,
              member_uuid: mh.member_uuid,
              philhealth: mh.philhealth,
              familyplanning: mh.familyplanning,
              lastmenstrualperiod: mh.lastmenstrualperiod,
              smoker: mh.smoker,
              alcoholdrinker: mh.alcoholdrinker,
              physicalactivity: mh.physicalactivity,
              morbidity: mh.morbidity,
              household_uuid: mh.household_uuid,
            },
          ],
          { onConflict: "uuid" }
        )
        .single();

      if (!error && data) {
        console.log(`✅ Member health info synced with uuid: ${mh.uuid}`);
        await db.runAsync("UPDATE memberhealthinfo SET synced = 1 WHERE uuid = ?;", [mh.uuid]);
      } else {
        console.error("❌ Error inserting member health info:", error?.message || "Unknown error");
      }
    }

    // 5) Immunization
    console.log("🔎 Checking for unsynced immunization data...");
    const unsyncedImmun = await db.getAllAsync(
      "SELECT * FROM immunization WHERE synced = 0"
    );
    for (const im of unsyncedImmun) {
      console.log("🚀 Syncing immunization:", im.uuid);
      const { data, error } = await supabase
        .from("immunization")
        .upsert(
          [
            {
              uuid: im.uuid,
              member_uuid: im.member_uuid,
              bcg: im.bcg,
              hepatitis: im.hepatitis,
              pentavalent: im.pentavalent,
              oralpolio: im.oralpolio,
              pneumococcal: im.pneumococcal,
              mmr: im.mmr,
              remarks: im.remarks,
              household_uuid: im.household_uuid,
            },
          ],
          { onConflict: "uuid" }
        )
        .single();

      if (!error && data) {
        console.log(`✅ Immunization synced with uuid: ${im.uuid}`);
        await db.runAsync("UPDATE immunization SET synced = 1 WHERE uuid = ?;", [im.uuid]);
      } else {
        console.error("❌ Error inserting immunization:", error?.message || "Unknown error");
      }
    }

    Alert.alert("Sync Complete", "All local data has been synced to Supabase.");
    console.log("✅ Sync completed successfully!");
  } catch (error) {
    console.error("❌ General Sync error:", error);
    Alert.alert("Sync Failed", "Something went wrong during sync.");
  }
};

/**
 * By default, we create tables on startup:
 */
(async () => {
  await createTables();
  // You can optionally run resetLocalDatabase() if needed.
})();

/**
 * Export everything as default
 */
export default {
  store,
  openDatabase,
  createTables,
  resetLocalDatabase,
  getUnsyncedData,
  insertHousehold,
  insertMealPattern,
  insertMember,
  updateMember,
  updateMemberData,
  insertMemberHealthInfo,
  insertImmunization,
  syncWithSupabase,
};
