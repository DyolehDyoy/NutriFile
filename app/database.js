import { observable } from '@legendapp/state';
import * as SQLite from 'expo-sqlite';
import supabase from '../app/supabaseClient';
import NetInfo from '@react-native-community/netinfo';

export const resetLocalDatabase = async () => {
  const database = await openDatabase();
  try {
    console.log("🗑️ Dropping and recreating local database...");

    // Drop tables if they exist
    await database.runAsync("DROP TABLE IF EXISTS household;");
    await database.runAsync("DROP TABLE IF EXISTS mealpattern;");
    await database.runAsync("DROP TABLE IF EXISTS addmember;");
    await database.runAsync("DROP TABLE IF EXISTS memberhealthinfo;");

    // Reset auto-increment sequences
    await database.runAsync("DELETE FROM sqlite_sequence WHERE name='household';");
    await database.runAsync("DELETE FROM sqlite_sequence WHERE name='mealpattern';");

    // Create tables again
    await createTables();

    // Reset Legend-State store
    store.households.set([]);
    store.mealPatterns.set([]);
    store.synced.set(false);

    console.log("✅ Local database and Legend-State store reset.");
  } catch (error) {
    console.error("❌ Error resetting local database:", error);
  }
};

// ✅ Create a Legend-State Store
export const store = observable({
  households: [],
  mealPatterns: [],
  synced: false, // Tracks sync status
});

let db = null;

// ✅ Open Database
export const openDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("nutrifile.db");
    console.log("✅ Database opened successfully.");
    await resetLocalDatabase();
    // 🛑 Reset the local database on startup is commented out
   
  }
  return db;
};

// ✅ Create Tables
export const createTables = async () => {
  console.log("🚀 Ensuring tables exist...");

  const database = await openDatabase();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS household (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sitio TEXT,
      householdnumber TEXT NOT NULL,  -- 🔄 Added NOT NULL constraint
      dateofvisit TEXT,
      toilet TEXT,
      sourceofwater TEXT,
      sourceofincome TEXT,
      foodproduction TEXT,
      membership4ps TEXT,
      synced INTEGER DEFAULT 0
    );
  `);

  // MEAL PATTERN
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

  // ADD MEMBERS
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS addmember (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstname TEXT,
      lastname TEXT,
      relationship TEXT,
      sex TEXT,
      dateofbirth DATE,  -- ✅ Ensure dateofbirth is included
      classification TEXT,
      weight FLOAT,
      height FLOAT,
      educationallevel TEXT,
      householdid INTEGER,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (householdid) REFERENCES household(id) ON DELETE CASCADE
    );
  `);

  // MEMBER HEALTH INFO
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS memberhealthinfo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      memberid INTEGER,  -- Foreign key to reference addmember
      philhealth TEXT,
      familyplanning TEXT,
      smoker TEXT,
      alcoholdrinker TEXT,
      physicalactivity TEXT,
      morbidity TEXT,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (memberid) REFERENCES addmember(id) ON DELETE CASCADE
    );
  `);

  console.log("✅ Tables are ready.");
};

// ✅ Insert Household
export const insertHousehold = async (data) => {
  const database = await openDatabase();

  if (!data.householdnumber || data.householdnumber.trim() === "") {
    console.error("❌ Cannot insert household: householdnumber is missing or empty.");
    return null;
  }

  console.log("🔎 Checking if householdnumber already exists...");

  const existingHousehold = await database.getFirstAsync(`
    SELECT id FROM household WHERE householdnumber = ? LIMIT 1;
  `, [data.householdnumber]);

  if (existingHousehold) {
    console.warn(`⚠️ Household with householdnumber ${data.householdnumber} already exists!`);
    return existingHousehold.id;  // Return existing ID instead of inserting a duplicate
  }

  console.log("📌 Inserting new household...");

  try {
    await database.runAsync(
      `INSERT INTO household (sitio, householdnumber, dateofvisit, toilet, sourceofwater, sourceofincome, foodproduction, membership4ps, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        data.sitio,
        data.householdnumber,
        data.dateofvisit,
        data.toilet,
        data.sourceofwater,
        data.sourceofincome,
        data.foodproduction,
        data.membership4ps,
        0  // synced = 0
      ]
    );

    const result = await database.getFirstAsync(`SELECT last_insert_rowid() AS id;`);
    const householdId = result.id;

    console.log("✅ Household data saved, ID:", householdId);
    return householdId;
  } catch (error) {
    console.error("❌ Error inserting household data:", error);
    return null;
  }
};

// ✅ Insert Meal Pattern
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

// ✅ Insert Member
export const insertMember = async (data) => {
  const database = await openDatabase();

  console.log("🛠️ DEBUG: insertMember Data Before Insert:", JSON.stringify(data, null, 2));

  if (!data.firstName || !data.lastName || !data.householdid) {
    console.error("❌ Cannot insert member: Missing required fields.");
    return null;
  }

  if (!data.dateofbirth || isNaN(Date.parse(data.dateofbirth))) {
    console.error("❌ Invalid date format for dateofbirth:", data.dateofbirth);
    return null;
  }

  // ✅ Convert empty strings for weight and height to NULL
  const weightValue = data.weight && !isNaN(parseFloat(data.weight)) ? parseFloat(data.weight) : null;
  const heightValue = data.height && !isNaN(parseFloat(data.height)) ? parseFloat(data.height) : null;

  console.log("📌 Inserting new member...");
  try {
    await database.runAsync(
      `INSERT INTO addmember (householdid, firstname, lastname, relationship, sex, dateofbirth, classification, weight, height, educationallevel, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        data.householdid,
        data.firstName,
        data.lastName,
        data.relationship,
        data.sex,
        data.dateofbirth,
        data.classification,
        weightValue,
        heightValue,
        data.educationLevel,
        0
      ]
    );

    const result = await database.getFirstAsync(`SELECT last_insert_rowid() AS id;`);
    console.log("✅ Member data saved, ID:", result.id);
    return result.id;
  } catch (error) {
    console.error("❌ Error inserting member data:", error);
    return null;
  }
};

// ✅ Insert Member Health Info
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
      `INSERT INTO memberhealthinfo (memberid, philhealth, familyplanning, smoker, alcoholdrinker, physicalactivity, morbidity, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        data.memberid,
        data.philHealth || "No",
        data.familyPlanning || "No",
        data.smoker || "No",
        data.alcoholdrinker || "No",
        data.physicalActivity || "No",
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

// ✅ Sync With Supabase
export const syncWithSupabase = async () => {
  const database = await openDatabase();

  try {
    console.log("🔎 Checking for unsynced households...");
    const unsyncedHouseholds = await database.getAllAsync("SELECT * FROM household WHERE synced = 0");

    // Sync unsynced households
    for (const household of unsyncedHouseholds) {
      console.log(`🚀 Syncing household: ${household.id}`);
      const { data, error } = await supabase
        .from("household")
        .insert([household])
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

    // Sync unsynced members
    for (const member of unsyncedMembers) {
      console.log(`🚀 Syncing member: ${member.id}`);
      const { data, error } = await supabase
        .from("addmember")
        .insert([member])
        .select("id")
        .single();

      if (!error && data) {
        console.log(`✅ Member ${member.id} synced with Supabase ID: ${data.id}`);
        await database.runAsync(`UPDATE addmember SET id = ?, synced = 1 WHERE id = ?`, [data.id, member.id]);
      } else {
        console.error("❌ Error inserting member:", error ? error.message : "Unknown error");
      }
    }

    console.log("🔎 Checking for unsynced meal patterns...");
    const unsyncedMealPatterns = await database.getAllAsync("SELECT * FROM mealpattern WHERE synced = 0");

    for (const mealPattern of unsyncedMealPatterns) {
      // 🔍 Ensure household exists before syncing meal pattern
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
        .insert([mealPattern])
        .select("id")
        .single();

      if (!error && data) {
        console.log(`✅ Meal Pattern synced with Supabase ID: ${data.id}`);
        await database.runAsync(`UPDATE mealpattern SET id = ?, synced = 1 WHERE id = ?`, [data.id, mealPattern.id]);
      } else {
        console.error("❌ Error inserting meal pattern:", error ? error.message : "Unknown error");
      }
    }

    console.log("🔎 Checking for unsynced member health info...");
const unsyncedHealthInfo = await database.getAllAsync(
  "SELECT * FROM memberhealthinfo WHERE synced = 0"
);

for (const health of unsyncedHealthInfo) {
  console.log(`🚀 Syncing health info for member: ${health.memberid}`);

  // Ensure the member exists in Supabase
  const { data: memberData } = await supabase
    .from("addmember")
    .select("id")
    .eq("id", health.memberid)
    .single();

  if (!memberData) {
    console.warn(`⚠️ Member ID ${health.memberid} not found in Supabase. Skipping health info sync.`);
    continue;
  }

  // Remove local "id" and "specify" from the data so Supabase doesn't see them
  const { id, specify, ...healthData } = health;

  // Now 'healthData' no longer has 'specify' or 'id'
  // and your Supabase table won't complain about missing 'specify' column
  const { data, error } = await supabase
    .from("memberhealthinfo")
    .insert([healthData])
    .select("id")
    .single();

  if (!error && data) {
    console.log(`✅ Member health info ${health.id} synced with Supabase ID: ${data.id}`);
    // Mark it synced in local DB
    await database.runAsync(`UPDATE memberhealthinfo SET synced = 1 WHERE id = ?`, [health.id]);
  } else {
    console.error("❌ Error inserting memberhealthinfo:", error?.message || "Unknown error");
  }
}


  } catch (error) {
    console.error("❌ General Sync error:", error);
  }
};

// ✅ Auto-Sync on Internet Connection
NetInfo.addEventListener((state) => {
  if (state.isConnected) {
    console.log("🌐 Internet detected: Syncing...");
    syncWithSupabase();
  }
});

// ✅ Export functions
export default {
  store, // Legend-State Store
  openDatabase,
  createTables,
  insertHousehold,
  insertMealPattern,
  // named export for insertMemberHealthInfo
  syncWithSupabase,
};
