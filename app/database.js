import * as SQLite from 'expo-sqlite';

console.log("SQLite:", SQLite); // ✅ Debugging: Check if SQLite is loaded

let db = null; // Initialize database as null

// Function to open the database (Async)
export const openDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("nutrifile.db"); // ✅ Use new async API
    console.log("✅ Database opened successfully.");
  }
  return db;
};

// Function to create tables
export const createTables = async () => {
  const database = await openDatabase(); // Open database first

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
      membership4Ps TEXT
    );
  `);
  console.log("✅ Household table created successfully");

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
      FOREIGN KEY (householdId) REFERENCES household(id)
    );
  `);
  console.log("✅ MealPattern table created successfully");
};

export const insertHousehold = async (data) => {
  const database = await openDatabase();
  try {
    await database.runAsync(
      `INSERT INTO household (sitio, householdNumber, dateOfVisit, toilet, sourceOfWater, sourceOfIncome, foodProduction, membership4Ps) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [data.sitio, data.householdNumber, data.dateOfVisit, data.toilet, data.sourceOfWater, data.sourceOfIncome, data.foodProduction, data.membership4Ps]
    );

    // Fetch last inserted ID
    const result = await database.getFirstAsync(`SELECT last_insert_rowid() AS id;`);
    const householdId = result.id;

    console.log("✅ Household data saved, ID:", householdId);
    return householdId; // ✅ Return ID to navigate to Meal Pattern screen
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
      `INSERT INTO mealPattern (householdId, breakfast, lunch, dinner, foodBelief, healthConsideration, whatIfSick, checkupFrequency) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [householdId, data.breakfast, data.lunch, data.dinner, data.foodBelief, data.healthConsideration, data.whatIfSick, data.checkupFrequency]
    );
    console.log("✅ Meal Pattern data saved:", { householdId, ...data });
  } catch (error) {
    console.error("❌ Error inserting meal pattern data:", error);
  }
};

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
export default { openDatabase, createTables, insertHousehold, insertMealPattern, debugViewDatabase };
