import * as SQLite from 'expo-sqlite';
import supabase from '../app/supabaseClient';
import NetInfo from '@react-native-community/netinfo';

console.log("📦 SQLite Loaded:", SQLite);

let db = null; // Initialize database as null

// Function to open the database (Async)
export const openDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("nutrifile.db");
    console.log("✅ Database opened successfully.");
  }
  return db;
};

// Function to create tables
export const createTables = async () => {
  const database = await openDatabase(); // Open database first

  // Drop old tables if they exist
  await database.execAsync(`DROP TABLE IF EXISTS household;`);
  await database.execAsync(`DROP TABLE IF EXISTS mealPattern;`);

  // Create new `household` table with `synced` column
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
      synced INTEGER DEFAULT 0  -- 0: Not Synced, 1: Synced
    );
  `);
  console.log("✅ Household table recreated successfully");

  // Create new `mealPattern` table with `synced` column
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
      synced INTEGER DEFAULT 0, -- 0: Not Synced, 1: Synced
      FOREIGN KEY (householdId) REFERENCES household(id)
    );
  `);
  console.log("✅ MealPattern table recreated successfully");
};


// Insert Household Data
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
    return householdId;
  } catch (error) {
    console.error("❌ Error inserting household data:", error);
    return null;
  }
};

// Insert Meal Pattern Data
export const insertMealPattern = async (householdId, data) => {
  const database = await openDatabase();
  try {
    await database.runAsync(
      `INSERT INTO mealPattern (householdId, breakfast, lunch, dinner, foodBelief, healthConsideration, whatIfSick, checkupFrequency, synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [householdId, data.breakfast, data.lunch, data.dinner, data.foodBelief, data.healthConsideration, data.whatIfSick, data.checkupFrequency, 0]
    );
    console.log("✅ Meal Pattern data saved:", { householdId, ...data });
  } catch (error) {
    console.error("❌ Error inserting meal pattern data:", error);
  }
};
export const syncWithSupabase = async () => {
  const database = await openDatabase();

  try {
    console.log("🔎 Checking for unsynced households...");

    // ✅ Fetch unsynced household data from SQLite
    const unsyncedHouseholds = await database.getAllAsync("SELECT * FROM household WHERE synced = 0");
    console.log("📊 Unsynced Households:", unsyncedHouseholds);

    for (const household of unsyncedHouseholds) {
      const supabaseHousehold = {
        sitio: household.sitio,
        householdnumber: household.householdNumber, 
        dateofvisit: household.dateOfVisit,        
        toilet: household.toilet,
        sourceofwater: household.sourceOfWater,    
        sourceofincome: household.sourceOfIncome,  
        foodproduction: household.foodProduction,  
        membership4ps: household.membership4Ps,    
        synced: true,
      };

      console.log("🚀 Syncing household to Supabase:", supabaseHousehold);

      // ✅ Use UPSERT (Insert or Update if exists)
      const { data, error } = await supabase.from("household")
        .upsert([supabaseHousehold], { onConflict: ["householdnumber"] });

      if (!error) {
        await database.runAsync(`UPDATE household SET synced = 1 WHERE id = ?`, [household.id]);
        console.log("✅ Household synced successfully:", data);
      } else {
        console.error("❌ Error syncing household:", error.message, error.details);
      }
    }

    // ✅ Fetch unsynced meal pattern data from SQLite
    const unsyncedMealPatterns = await database.getAllAsync("SELECT * FROM mealPattern WHERE synced = 0");
    console.log("📊 Unsynced Meal Patterns:", unsyncedMealPatterns);

    for (const meal of unsyncedMealPatterns) {
      const supabaseMeal = {
        householdid: meal.householdId,           
        breakfast: meal.breakfast,
        lunch: meal.lunch,
        dinner: meal.dinner,
        foodbelief: meal.foodBelief,             
        healthconsideration: meal.healthConsideration, 
        whatifsick: meal.whatIfSick,             
        checkupfrequency: meal.checkupFrequency, 
        synced: true,
      };

      console.log("🚀 Syncing meal pattern to Supabase:", supabaseMeal);

      // ✅ Insert into Supabase
      const { data, error } = await supabase.from("mealpattern").insert([supabaseMeal]);

      if (error) {
        console.error("❌ Error syncing meal pattern:", error.message, error.details);
      } else {
        console.log("✅ Meal Pattern synced successfully:", data);
        await database.runAsync(`UPDATE mealPattern SET synced = 1 WHERE id = ?`, [meal.id]);
      }
    }
  } catch (error) {
    console.error("❌ General Sync error:", error);
  }
};



// Function to fetch latest data from Supabase and sync it with local database
export const fetchFromSupabase = async () => {
  const database = await openDatabase();

  try {
    const { data: householdData, error: householdError } = await supabase.from("household").select("*");

    if (!householdError) {
      for (const household of householdData) {
        await database.runAsync(
          `INSERT OR REPLACE INTO household (id, sitio, householdNumber, dateOfVisit, toilet, sourceOfWater, sourceOfIncome, foodProduction, membership4Ps, synced) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [household.id, household.sitio, household.householdNumber, household.dateOfVisit, household.toilet, household.sourceOfWater, household.sourceOfIncome, household.foodProduction, household.membership4Ps, 1]
        );
      }
      console.log("✅ Household data fetched and updated locally.");
    } else {
      console.error("❌ Error fetching household data:", householdError);
    }

    const { data: mealData, error: mealError } = await supabase.from("mealPattern").select("*");

    if (!mealError) {
      for (const meal of mealData) {
        await database.runAsync(
          `INSERT OR REPLACE INTO mealPattern (id, householdId, breakfast, lunch, dinner, foodBelief, healthConsideration, whatIfSick, checkupFrequency, synced) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [meal.id, meal.householdId, meal.breakfast, meal.lunch, meal.dinner, meal.foodBelief, meal.healthConsideration, meal.whatIfSick, meal.checkupFrequency, 1]
        );
      }
      console.log("✅ Meal pattern data fetched and updated locally.");
    } else {
      console.error("❌ Error fetching meal pattern data:", mealError);
    }
  } catch (error) {
    console.error("❌ Error fetching data from Supabase:", error);
  }
};

// Auto-sync when online
NetInfo.addEventListener((state) => {
  if (state.isConnected) {
    console.log("🌐 Internet detected: Syncing...");
    syncWithSupabase();
  }
});

// Function to View Saved Data in Terminal
export const debugViewDatabase = async () => {
  const database = await openDatabase();
  try {
    const householdData = await database.getAllAsync("SELECT * FROM household");
    console.log("🏠 Household Data:", householdData);

    const mealData = await database.getAllAsync("SELECT * FROM mealPattern");
    console.log("🍽️ Meal Pattern Data:", mealData);
  } catch (error) {
    console.error("❌ Error fetching database data:", error);
  }
};

// Export functions
export default {
  openDatabase,
  createTables,
  insertHousehold,
  insertMealPattern,
  syncWithSupabase,
  fetchFromSupabase,
  debugViewDatabase,
};
