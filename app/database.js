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
    await database.runAsync("DROP TABLE IF EXISTS mealpattern;");  // ✅ Drop correct table before recreating
    
    // Reset auto-increment sequences
    await database.runAsync("DELETE FROM sqlite_sequence WHERE name='household';");
    await database.runAsync("DELETE FROM sqlite_sequence WHERE name='mealpattern';"); // ✅ Corrected to lowercase

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
    // 🛑 Reset the local database on startup
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
    );`);
  
  console.log("✅ Tables are ready.");
  
};

export const insertHousehold = async (data) => {
  const database = await openDatabase();

  if (!data.householdnumber || data.householdnumber.trim() === "") {
    console.error("❌ Cannot insert household: householdnumber is missing or empty.");
    return null;
  }

  console.log("🔎 Checking if householdnumber already exists...");
  
  // 🔍 Check if householdnumber already exists
  const { data: existingHousehold, error } = await supabase
    .from("household")
    .select("id")
    .eq("householdnumber", data.householdnumber)
    .single();

  if (existingHousehold) {
    console.warn(`⚠️ Household with householdnumber ${data.householdnumber} already exists!`);
    return existingHousehold.id; // ✅ Return existing ID instead of inserting a duplicate
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
        0
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
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,  // ✅ Table name and fields are lowercase
      [
        householdid, 
        data.breakfast, 
        data.lunch, 
        data.dinner, 
        data.foodbelief,  // ✅ Matches Supabase (lowercase)
        data.healthconsideration,  // ✅ Matches Supabase (lowercase)
        data.whatifsick,  // ✅ Matches Supabase (lowercase)
        data.checkupfrequency,  // ✅ Matches Supabase (lowercase)
        0
      ]
    );

    const result = await database.getFirstAsync(`SELECT last_insert_rowid() AS id;`);
    const mealPatternId = result.id;

    console.log("✅ Meal Pattern data saved, ID:", mealPatternId);
    return true;
  } catch (error) {
    console.error("❌ Error inserting meal pattern data:", error);
    return false;
  }
};

export const syncWithSupabase = async () => {
  const database = await openDatabase();

  try {
    console.log("🔎 Checking for unsynced households...");
    const unsyncedHouseholds = await database.getAllAsync("SELECT * FROM household WHERE synced = 0");

    for (const household of unsyncedHouseholds) {
      console.log(`🚀 Syncing household: ${household.id}`);

      const { data, error } = await supabase.from("household").insert([household]).select("id").single();

      if (!error && data) {
        console.log(`✅ Household ${household.id} synced with Supabase ID: ${data.id}`);
        await database.runAsync(`UPDATE household SET id = ?, synced = 1 WHERE id = ?`, [data.id, household.id]);
      } else {
        console.error("❌ Error inserting household:", error ? error.message : "Unknown error");
      }
    }

    console.log("🔎 Checking for unsynced meal patterns...");
    const unsyncedMealPatterns = await database.getAllAsync("SELECT * FROM mealpattern WHERE synced = 0");

    for (const mealPattern of unsyncedMealPatterns) {
      // 🔍 Ensure household exists before syncing meal pattern
      const { data: householdData } = await supabase.from("household").select("id").eq("id", mealPattern.householdid).single();

      if (!householdData) {
        console.warn(`⚠️ Household ID ${mealPattern.householdid} not found in Supabase. Skipping meal pattern sync.`);
        continue;
      }

      console.log(`🚀 Syncing meal pattern for household: ${mealPattern.householdid}`);
      const { data, error } = await supabase.from("mealpattern").insert([mealPattern]).select("id").single();

      if (!error && data) {
        console.log(`✅ Meal Pattern synced with Supabase ID: ${data.id}`);
        await database.runAsync(`UPDATE mealpattern SET id = ?, synced = 1 WHERE id = ?`, [data.id, mealPattern.id]);
      } else {
        console.error("❌ Error inserting meal pattern:", error ? error.message : "Unknown error");
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
  syncWithSupabase,
};
