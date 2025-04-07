import { observable } from '@legendapp/state';
import * as SQLite from 'expo-sqlite';
import supabase from '../app/supabaseClient';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from "react-native";


// RESET LOCAL DATABASE
export const resetLocalDatabase = async () => {
  const database = await openDatabase();
  try {
    console.log("🗑️ Dropping and recreating local database...");

    // Drop tables if they exist
    await database.runAsync("DROP TABLE IF EXISTS household;");
    await database.runAsync("DROP TABLE IF EXISTS mealpattern;");
    await database.runAsync("DROP TABLE IF EXISTS addmember;");
    await database.runAsync("DROP TABLE IF EXISTS memberhealthinfo;");
    await database.runAsync("DROP TABLE IF EXISTS immunization;");

    // Reset auto-increment sequences
    try {
      await database.runAsync("DELETE FROM sqlite_sequence WHERE name='household';");
    } catch (e) {
      console.warn("⚠️ household sequence not reset:", e.message);
    }
    try {
      await database.runAsync("DELETE FROM sqlite_sequence WHERE name='mealpattern';");
    } catch (e) {
      console.warn("⚠️ mealpattern sequence not reset:", e.message);
    }
    try {
      await database.runAsync("DELETE FROM sqlite_sequence WHERE name='addmember';");
    } catch (e) {
      console.warn("⚠️ addmember sequence not reset:", e.message);
    }
    try {
      await database.runAsync("DELETE FROM sqlite_sequence WHERE name='memberhealthinfo';");
    } catch (e) {
      console.warn("⚠️ memberhealthinfo sequence not reset:", e.message);
    }
    try {
      await database.runAsync("DELETE FROM sqlite_sequence WHERE name='immunization';");
    } catch (e) {
      console.warn("⚠️ immunization sequence not reset:", e.message);
    }
    

    // Create tables again
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

// OPEN DATABASE
export const openDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("nutrifile.db");
    console.log("✅ Database opened successfully.");
    // Optionally, uncommment the following line to reset on startup:
   //await resetLocalDatabase();
  }
  return db;
};

// CREATE TABLES
export const createTables = async () => {
  console.log("🚀 Ensuring tables exist...");
  const database = await openDatabase();

  // Household table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS household (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      district TEXT,  -- ✅ Added District
      barangay TEXT,  -- ✅ Added Barangay
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      householdid INTEGER,
      breakfast TEXT,
      lunch TEXT,
      dinner TEXT,
      foodbelief TEXT,
      healthconsideration TEXT,
      whatifsick TEXT,
      checkupfrequency TEXT,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (householdid) REFERENCES household(id) ON DELETE CASCADE
    );
  `);


  // add member
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS addmember (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      householdid INTEGER,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (householdid) REFERENCES household(id) ON DELETE CASCADE
    );
  `);

  // Member Health Info table (separate table for health data)
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS memberhealthinfo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      memberid INTEGER,
      philhealth TEXT,
      familyplanning TEXT,
      lastmenstrualperiod TEXT, -- ✅ New field for LMP
      smoker TEXT,
      alcoholdrinker TEXT,
      physicalactivity TEXT,
      morbidity TEXT,
      householdid INTEGER,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (memberid) REFERENCES addmember(id) ON DELETE CASCADE
      FOREIGN KEY (householdid) REFERENCES household(id) ON DELETE CASCADE
    );
  `);

  // Immunization table (using memberid as foreign key)
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS immunization (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      memberid INTEGER,
      bcg TEXT,
      hepatitis TEXT,
      pentavalent TEXT,
      oralpolio TEXT,
      pneumococcal TEXT,
      mmr TEXT,
      remarks TEXT,
      householdid INTEGER,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (memberid) REFERENCES addmember(id) ON DELETE CASCADE
      FOREIGN KEY (householdid) REFERENCES household(id) ON DELETE CASCADE
    );
  `);

  console.log("✅ Tables are ready.");
};

// INSERT FUNCTIONS

export const insertHousehold = async (data) => {
  const database = await openDatabase();

  if (!data.householdnumber || data.householdnumber.trim() === "") {
    Alert.alert("Missing Info", "Household number is required.");
    return null;
  }

  console.log("🔎 Checking if householdnumber already exists...");
  const existingHousehold = await database.getFirstAsync(
    `SELECT id FROM household WHERE householdnumber = ? LIMIT 1;`,
    [data.householdnumber]
  );

  if (existingHousehold) {
    Alert.alert("Duplicate Entry", `Household #${data.householdnumber} already exists locally.`);
    return existingHousehold.id;
  }

  console.log("📌 Inserting new household locally...");
  try {
    await database.runAsync(
      `INSERT INTO household (
        district, barangay, sitio, householdnumber, dateofvisit, toilet, sourceofwater, 
        sourceofincome, foodproductionvegetable, foodproductionanimals, membership4ps, synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
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
        0
      ]
    );

    const result = await database.getFirstAsync(`SELECT last_insert_rowid() AS id;`);
    const householdId = result.id;
    console.log("✅ Household saved locally with ID:", householdId);

    const net = await NetInfo.fetch();
    if (net.isConnected) {
      console.log("🌐 Device is online. Attempting Supabase sync...");
      const { error } = await supabase
        .from("household")
        .insert([{ ...data, id: householdId }]);

      if (!error) {
        await database.runAsync(`UPDATE household SET synced = 1 WHERE id = ?;`, [householdId]);
        Alert.alert("Success", "Household saved and synced to the cloud.");
      } else {
        console.warn("⚠️ Supabase sync failed:", error.message);
        Alert.alert("Saved Locally", "Saved offline. Will sync when online.");
      }
    } else {
      console.log("📴 Offline mode. Skipping Supabase sync.");
      Alert.alert("Saved Locally", "You're offline. Data will sync when connected.");
    }

    return householdId;

  } catch (error) {
    console.error("❌ Error inserting household:", error);
    Alert.alert("Error", "Something went wrong while saving data.");
    return null;
  }
};



// Insert Meal Pattern
export const insertMealPattern = async (householdid, data) => {
  const database = await openDatabase();
  if (!householdid) {
    console.error("❌ Cannot insert meal pattern: householdid is missing.");
    return false;
  }
  console.log("📌 Attempting to insert Meal Pattern:", JSON.stringify({ householdid, ...data }, null, 2));
  try {
    await database.runAsync(
      `INSERT INTO mealpattern (householdid, breakfast, lunch, dinner, foodbelief, healthconsideration, whatifsick, checkupfrequency, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        householdid,
        data.breakfast,
        data.lunch,
        data.dinner,
        data.foodbelief,
        data.healthconsideration,
        data.whatifsick,
        data.checkupfrequency,
        0
      ]
    );
    const result = await database.getFirstAsync(`SELECT last_insert_rowid() AS id;`);
    console.log("✅ Meal Pattern data saved, ID:", result.id);
    return true;
  } catch (error) {
    console.error("❌ Error inserting meal pattern data:", error);
    return false;
  }
};

// Insert Member 
// Insert Member (Offline-First)
export const insertMember = async (data) => {
  const database = await openDatabase();

  // Basic validations
  if (!data.firstname || !data.lastname || !data.householdid) {
    console.error("❌ Cannot insert member: Missing required fields.");
    return null;
  }

  // Validate and parse date
  if (!data.dateofbirth || isNaN(Date.parse(data.dateofbirth))) {
    console.error("❌ Invalid date format for dateofbirth:", data.dateofbirth);
    return null;
  }

  // Convert empty strings to NULL for weight/height
  const weightValue =
    data.weight && !isNaN(parseFloat(data.weight)) ? parseFloat(data.weight) : null;
  const heightValue =
    data.height && !isNaN(parseFloat(data.height)) ? parseFloat(data.height) : null;

  try {
    // 1) Insert member locally
    await database.runAsync(
      `INSERT INTO addmember (
        householdid, firstname, lastname, relationship, sex, dateofbirth,
        classification, healthrisk, weight, height, educationallevel, synced
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`, // synced=0 by default
      [
        data.householdid,
        data.firstname,
        data.lastname,
        data.relationship,
        data.sex,
        data.dateofbirth,
        data.classification,
        data.healthrisk || "",
        weightValue,
        heightValue,
        data.educationallevel
      ]
    );

    // Grab the new local member ID
    const result = await database.getFirstAsync(
      `SELECT last_insert_rowid() AS id;`
    );
    const localMemberId = result.id;
    console.log("✅ Member data saved locally, ID:", localMemberId);

    // 2) Check for internet and sync immediately if online
    const net = await NetInfo.fetch();
    if (net.isConnected) {
      console.log("🌐 Online: Attempting to sync member with Supabase...");
      const { data: supabaseData, error } = await supabase
        .from("addmember")
        .upsert(
          {
            id: localMemberId, // We'll store the local ID as the primary key
            householdid: data.householdid,
            firstname: data.firstname,
            lastname: data.lastname,
            relationship: data.relationship,
            sex: data.sex,
            dateofbirth: data.dateofbirth,
            classification: data.classification,
            healthrisk: data.healthrisk || "",
            weight: weightValue,
            height: heightValue,
            educationallevel: data.educationallevel
          },
          { onConflict: "id" }
        ) // upsert means insert or update
        .select()
        .single();

      if (!error && supabaseData) {
        console.log("✅ Member synced with Supabase ID:", supabaseData.id);
        // Mark this record as synced in local DB
        await database.runAsync(
          `UPDATE addmember SET synced = 1 WHERE id = ?;`,
          [localMemberId]
        );
      } else {
        console.error("❌ Error syncing member:", error?.message || "Unknown error");
      }
    } else {
      console.log("📴 Offline mode, member saved locally. Will sync later.");
    }

    // Return the local member ID so the UI can navigate or do further actions
    return localMemberId;

  } catch (error) {
    console.error("❌ Error inserting member data:", error);
    return null;
  }
};


// Update Member – You can keep this if you want, but not needed for health data
export const updateMember = async (memberId, data) => {
  const database = await openDatabase();
  try {
    const fields = [];
    const values = [];
    for (const key in data) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
    // Mark record unsynced
    fields.push("synced = ?");
    values.push(0);

    values.push(memberId);
    const query = `UPDATE addmember SET ${fields.join(", ")} WHERE id = ?;`;
    await database.runAsync(query, values);
    const updated = await database.getFirstAsync(
      `SELECT * FROM addmember WHERE id = ?;`,
      [memberId]
    );
    console.log("✅ updateMember: record updated:", updated);
    return updated;
  } catch (error) {
    console.error("❌ Error updating member:", error);
    return null;
  }
};

export const updateMemberData = async (memberId, updatedData) => {
  const database = await openDatabase();

  try {
    console.log("🛠 Updating member with ID:", memberId);
    console.log("🔍 Data to update:", updatedData);

    // ✅ 1. Update local SQLite database
    const fields = Object.keys(updatedData)
      .filter((key) => updatedData[key] !== undefined) // Ignore undefined fields
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updatedData).filter((value) => value !== undefined); // Remove undefined values
    values.push(memberId);

    if (fields.length === 0) {
      console.warn("⚠️ No fields to update.");
      return { success: false, message: "No fields to update" };
    }

    const query = `UPDATE addmember SET ${fields} WHERE id = ?;`;
    await database.runAsync(query, values);
    console.log("✅ Local database updated successfully!");

    // ✅ 2. Update Supabase database
    const { error } = await supabase
      .from("addmember")
      .update(updatedData)
      .eq("id", memberId);

    if (error) {
      console.error("❌ Supabase Update Error:", error.message);
      return { success: false, message: error.message };
    }

    console.log("✅ Supabase database updated successfully!");
    return { success: true };
  } catch (error) {
    console.error("❌ Error updating member data:", error);
    return { success: false, message: error.message };
  }
};


// Insert Member Health Info – for storing health data in a separate table
export const insertMemberHealthInfo = async (data) => {
  const database = await openDatabase();
  console.log("🛠️ DEBUG: insertMemberHealthInfo Data Before Insert:", JSON.stringify(data, null, 2));
  if (!data.memberid) {
    console.error("❌ Cannot insert member health info: Missing member ID.");
    return null;
  }
  console.log("📌 Inserting new member health info...");
  try {
    await database.runAsync(
      `INSERT INTO memberhealthinfo (householdid, memberid, philhealth, familyplanning, lastmenstrualperiod, smoker, alcoholdrinker, physicalactivity, morbidity, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,  // ✅ Ensure 10 values are inserted
      [
        data.householdid,
        data.memberid,
        data.philhealth || "No",
        data.familyplanning || "No",
        data.lastmenstrualperiod || null,  // ✅ Ensure LMP is included
        data.smoker || "No",
        data.alcoholdrinker || "No",
        data.physicalactivity || "No",
        data.morbidity || "Absence",
        0
      ]
    );
    const result = await database.getFirstAsync(`SELECT last_insert_rowid() AS id;`);
    console.log("✅ Member health info saved, ID:", result.id);
    return result.id;
  } catch (error) {
    console.error("❌ Error inserting member health info:", error);
    return null;
  }
};


// Insert Immunization Data
export const insertImmunization = async (data) => {
  const database = await openDatabase();
  console.log("🛠️ DEBUG: insertImmunization Data Before Insert:", JSON.stringify(data, null, 2));
  if (!data.memberid) {
    console.error("❌ Cannot insert immunization: Missing member ID.");
    return null;
  }
  try {
    await database.runAsync(
      `INSERT INTO immunization (householdid, memberid, bcg, hepatitis, pentavalent, oralpolio, pneumococcal, mmr, remarks, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        data.householdid,
        data.memberid,
        data.bcg,
        data.hepatitis,
        data.pentavalent, 
        data.oralPolio,
        data.pneumococcal,
        data.mmr,
        data.remarks,
        0
      ]
    );
    const result = await database.getFirstAsync(`SELECT last_insert_rowid() AS id;`);
    console.log("✅ Immunization data saved, ID:", result.id);
    return result.id;
  } catch (error) {
    console.error("❌ Error inserting immunization data:", error);
    return null;
  }
};

// Sync With Supabase
export const syncWithSupabase = async () => {
  const database = await openDatabase();
  try {
    console.log("🔎 Checking for unsynced households...");
const unsyncedHouseholds = await database.getAllAsync("SELECT * FROM household WHERE synced = 0");

for (const household of unsyncedHouseholds) {
  console.log(`🚀 Syncing household: ${household.id}`);

  const { data, error } = await supabase
    .from("household")
    .upsert([
      {
        district: household.district,  // ✅ Include District
        barangay: household.barangay,  // ✅ Include Barangay
        id: household.id,
        sitio: household.sitio,
        householdnumber: household.householdnumber,
        dateofvisit: household.dateofvisit,
        toilet: household.toilet,
        sourceofwater: household.sourceofwater,
        sourceofincome: household.sourceofincome,
        foodproductionvegetable: household.foodproductionvegetable, // ✅ New column
        foodproductionanimals: household.foodproductionanimals, // ✅ New column
        membership4ps: household.membership4ps,
      }
    ])
    .select("id")
    .single();

  if (!error && data) {
    console.log(`✅ Household ${household.id} synced with Supabase ID: ${data.id}`);
    await database.runAsync(`UPDATE household SET id = ?, synced = 1 WHERE id = ?`, [data.id, household.id]);
  } else {
    console.error("❌ Error inserting household:", error ? error.message : "Unknown error");
  }
}


    console.log("🔎 Checking for unsynced members...");
    const unsyncedMembers = await database.getAllAsync("SELECT * FROM addmember WHERE synced = 0");
    for (const member of unsyncedMembers) {
      console.log(`🚀 Syncing member: ${member.id}`);
      // Upsert basic info to the addmember table in Supabase
      const { data, error } = await supabase
        .from("addmember")
        .upsert(member, { onConflict: "id" })
        .select("id")
        .single();
      if (!error && data) {
        console.log(`✅ Member ${member.id} synced (upserted) with Supabase ID: ${data.id}`);
        await database.runAsync(`UPDATE addmember SET synced = 1 WHERE id = ?`, [member.id]);
      } else {
        console.error("❌ Error syncing member:", error ? error.message : "Unknown error");
      }
    }

    console.log("🔎 Checking for unsynced meal patterns...");
    const unsyncedMealPatterns = await database.getAllAsync("SELECT * FROM mealpattern WHERE synced = 0");
    for (const mealPattern of unsyncedMealPatterns) {
      const { data: householdData } = await supabase
        .from("household")
        .select("id")
        .eq("id", mealPattern.householdid)
        .single();
      if (!householdData) {
        console.warn(`⚠️ Household ID ${mealPattern.householdid} not found in Supabase. Skipping meal pattern sync.`);
        continue;
      }
      console.log(`🚀 Syncing meal pattern for household: ${mealPattern.householdid}`);
      const { data, error } = await supabase
        .from("mealpattern")
        .upsert([mealPattern], { onConflict: "id" }) // 👈 Upsert based on ID
        .select("id")
        .single();
      if (!error && data) {
        console.log(`✅ Meal Pattern synced with Supabase ID: ${data.id}`);
        await database.runAsync(`UPDATE mealpattern SET synced = 1 WHERE id = ?`, [mealPattern.id]);
      } else {
        console.error("❌ Error inserting meal pattern:", error ? error.message : "Unknown error");
      }
    }
    
    console.log("🔎 Checking for unsynced member health info...");
const unsyncedHealthInfo = await database.getAllAsync("SELECT * FROM memberhealthinfo WHERE synced = 0");
for (const health of unsyncedHealthInfo) {
  console.log(`🚀 Syncing health info for member: ${health.memberid}`);
  const { data: memberData } = await supabase
    .from("addmember")
    .select("id")
    .eq("id", health.memberid)
    .single();
  if (!memberData) {
    console.warn(`⚠️ Member ID ${health.memberid} not found in Supabase. Skipping health info sync.`);
    continue;
  }
  
  const { data, error } = await supabase
    .from("memberhealthinfo")
    .insert([health])
    .select("id")
    .single();
  if (!error && data) {
    console.log(`✅ Member health info ${health.id} synced with Supabase ID: ${data.id}`);
    await database.runAsync(`UPDATE memberhealthinfo SET synced = 1 WHERE id = ?`, [health.id]);
  } else {
    console.error("❌ Error inserting member health info:", error?.message || "Unknown error");
  }
}


console.log("🔎 Checking for unsynced immunization data...");
const unsyncedImmunization = await database.getAllAsync("SELECT * FROM immunization WHERE synced = 0");
for (const immun of unsyncedImmunization) {
  // Ensure the corresponding member exists in Supabase.
  const { data: memberData } = await supabase
    .from("addmember")
    .select("id")
    .eq("id", immun.memberid)
    .single();
  if (!memberData) {
    console.warn(`⚠️ Member ID ${immun.memberid} not found in Supabase. Skipping immunization sync.`);
    continue;
  }
  console.log(`🚀 Syncing immunization for member: ${immun.memberid}`);
  // Use upsert so that if a record exists it is updated; otherwise, it is inserted.
  const { data, error } = await supabase
    .from("immunization")
    .upsert(immun, { onConflict: "id" })
    .select("id")
    .single();
  if (!error && data) {
    console.log(`✅ Immunization synced with Supabase ID: ${data.id}`);
    await database.runAsync(`UPDATE immunization SET synced = 1 WHERE id = ?`, [immun.id]);
  } else {
    console.error("❌ Error inserting immunization:", error?.message || "Unknown error");
  }
}


    console.log("✅ Sync completed successfully!");
  } catch (error) {
    console.error("❌ General Sync error:", error);
  }
};

// Auto-Sync on Internet Connection
NetInfo.addEventListener((state) => {
  if (state.isConnected) {
    console.log("🌐 Internet detected: Syncing...");
    syncWithSupabase();
    Alert.alert("✅ Sync Complete", "All local data has been synced to Supabase.");
  }
});


const checkTableSchema = async () => {
  const database = await openDatabase();
  const schema = await database.getAllAsync(`PRAGMA table_info(addmember);`);
  console.log("📝 Current SQLite Schema for `addmember` Table:", schema);
};

checkTableSchema(); // ✅ Run this when app starts

// Export functions
export default {
  store, // Legend-State Store
  openDatabase,
  createTables,
  insertHousehold,
  insertMealPattern,
  insertMember,
  updateMemberData,  // ✅ Make sure this is included
  insertMemberHealthInfo,
  insertImmunization,
  syncWithSupabase,
};
