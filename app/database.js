import { observable } from '@legendapp/state';
import * as SQLite from 'expo-sqlite';
import supabase from '../app/supabaseClient';
import NetInfo from '@react-native-community/netinfo';

console.log("📦 Legend-State & SQLite Loaded");

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
  }
  return db;
};

// ✅ Create Tables
export const createTables = async () => {
  const database = await openDatabase();
  console.log("🚀 Ensuring tables exist...");

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS household (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sitio TEXT,
      householdNumber TEXT,
      dateOfVisit TEXT,
      toilet TEXT,
      sourceOfWater TEXT,
      sourceOfIncome TEXT,
      foodProduction TEXT,
      membership4Ps TEXT,
      synced INTEGER DEFAULT 0
    );`);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS mealPattern (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      householdId INTEGER,
      breakfast TEXT,
      lunch TEXT,
      dinner TEXT,
      foodBelief TEXT,
      healthConsideration TEXT,
      whatIfSick TEXT,
      checkupFrequency TEXT,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (householdId) REFERENCES household(id)
    );`);

  console.log("✅ Tables are ready.");
};

// ✅ Insert Household Data
export const insertHousehold = async (data) => {
  const database = await openDatabase();
  try {
    await database.runAsync(
      `INSERT INTO household (sitio, householdNumber, dateOfVisit, toilet, sourceOfWater, sourceOfIncome, foodProduction, membership4Ps, synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [data.sitio, data.householdNumber, data.dateOfVisit, data.toilet, data.sourceOfWater, data.sourceOfIncome, data.foodProduction, data.membership4Ps, 0]
    );

    // Fetch last inserted ID
    const result = await database.getFirstAsync(`SELECT last_insert_rowid() AS id;`);
    const householdId = result.id;

    console.log("✅ Household data saved, ID:", householdId);

    // ✅ Update Legend-State
    store.households.push({ ...data, id: householdId, synced: false });

    // ✅ Attempt sync
    await syncWithSupabase();

    return householdId;
  } catch (error) {
    console.error("❌ Error inserting household data:", error);
    return null;
  }
};

// ✅ Insert Meal Pattern Data
export const insertMealPattern = async (householdId, data) => {
  const database = await openDatabase();
  try {
    await database.runAsync(
      `INSERT INTO mealPattern (householdId, breakfast, lunch, dinner, foodBelief, healthConsideration, whatIfSick, checkupFrequency, synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [householdId, data.breakfast, data.lunch, data.dinner, data.foodBelief, data.healthConsideration, data.whatIfSick, data.checkupFrequency, 0]
    );

    console.log("✅ Meal Pattern data saved locally:", { householdId, ...data });

    // ✅ Update Legend-State
    store.mealPatterns.push({ ...data, householdId, synced: false });

    // ✅ Attempt sync
    await syncWithSupabase();

    return true;
  } catch (error) {
    console.error("❌ Error inserting meal pattern data:", error);
    return false;
  }
};

// ✅ Sync Data with Supabase
export const syncWithSupabase = async () => {
  const database = await openDatabase();

  try {
    console.log("🔎 Checking for unsynced households...");

    // ✅ Fetch unsynced households
    const unsyncedHouseholds = await database.getAllAsync("SELECT * FROM household WHERE synced = 0");

    for (const household of unsyncedHouseholds) {
      console.log(`🚀 Syncing household: ${household.id}`);

      // ✅ Insert into Supabase
      const { data, error } = await supabase.from("household").insert([{
        sitio: household.sitio,
        householdNumber: household.householdNumber,
        dateOfVisit: household.dateOfVisit,
        toilet: household.toilet,
        sourceOfWater: household.sourceOfWater,
        sourceOfIncome: household.sourceOfIncome,
        foodProduction: household.foodProduction,
        membership4Ps: household.membership4Ps,
        synced: true
      }]).select("id").single();

      if (!error && data) {
        const supabaseId = data.id;
        console.log(`✅ Household ${household.id} synced with Supabase ID: ${supabaseId}`);

        // ✅ Update local DB
        await database.runAsync(`UPDATE household SET id = ?, synced = 1 WHERE id = ?`, [supabaseId, household.id]);

        // ✅ Update Legend-State
        store.households.find(h => h.id === household.id).set({ synced: true });

        // ✅ Sync meal patterns
        await database.runAsync(`UPDATE mealPattern SET householdId = ? WHERE householdId = ?`, [supabaseId, household.id]);
      } else {
        console.error("❌ Error syncing household:", error.message);
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
