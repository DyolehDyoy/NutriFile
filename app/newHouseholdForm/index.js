import { Menu, IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import the icon
import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  RadioButton,
  Switch,
  Card,
  Divider,
  SegmentedButtons,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import { insertHousehold, syncWithSupabase, createTables } from "../database";

const barangaysByDistrict = {
  Poblacion: [
    "1-A", "2-A", "3-A", "4-A", "5-A", "6-A", "7-A", "8-A", "9-A", "10-A",
    "11-B", "12-B", "13-B", "14-B", "15-B", "16-B", "17-B", "18-B", "19-B", "20-B",
    "21-C", "22-C", "23-C", "24-C", "25-C", "26-C", "27-C", "28-C", "29-C", "30-C",
    "31-D", "32-D", "33-D", "34-D", "35-D", "36-D", "37-D", "38-D", "39-D", "40-D"
  ],
  Talomo: [
    "Bago Aplaya", "Bago Gallera", "Baliok", "Bucana", "Catalunan Grande",
    "Catalunan Pequeño", "Dumoy", "Langub", "Ma-a", "Magtuod", "Matina Aplaya",
    "Matina Crossing", "Matina Pangi", "Talomo Proper"
  ],
  Agdao: [
    "Agdao Proper", "Centro (San Juan)", "Gov. Paciano Bangoy", "Gov. Vicente Duterte",
    "Kap. Tomas Monteverde, Sr.", "Lapu-Lapu", "Leon Garcia", "Rafael Castillo",
    "San Antonio", "Ubalde", "Wilfredo Aquino"
  ],
  Buhangin: [
    "Acacia", "Alfonso Angliongto Sr.", "Buhangin Proper", "Cabantian", "Callawa",
    "Communal", "Indangan", "Mandug", "Pampanga", "Sasa", "Tigatto", "Vicente Hizon Sr.", "Waan"
  ],
  Bunawan: [
    "Alejandra Navarro (Lasang)", "Bunawan Proper", "Gatungan", "Ilang", "Mahayag",
    "Mudiang", "Panacan", "San Isidro (Licanan)", "Tibungco"
  ],
  Paquibato: [
    "Colosas", "Fatima (Benowang)", "Lumiad", "Mabuhay", "Malabog", "Mapula", "Panalum",
    "Pandaitan", "Paquibato Proper", "Paradise Embak", "Salapawan", "Sumimao", "Tapak"
  ],
  Baguio: [
    "Baguio Proper", "Cadalian", "Carmen", "Gumalang", "Malagos", "Tambobong",
    "Tawan-Tawan", "Wines"
  ],
  Calinan: [
    "Biao Joaquin", "Calinan Proper", "Cawayan", "Dacudao", "Dalagdag", "Dominga",
    "Inayangan", "Lacson", "Lamanan", "Lampianao", "Megkawayan", "Pangyan", "Riverside",
    "Saloy", "Sirib", "Subasta", "Talomo River", "Tamayong", "Wangan"
  ],
  Marilog: [
    "Baganihan", "Bantol", "Buda", "Dalag", "Datu Salumay", "Gumitan",
    "Magsaysay", "Malamba", "Marilog Proper", "Salaysay", "Suawan (Tuli)", "Tamugan"
  ],
  Toril: [
    "Alambre", "Atan-Awe", "Bangkas Heights", "Baracatan", "Bato", "Bayabas",
    "Binugao", "Camansi", "Catigan", "Crossing Bayabas", "Daliao", "Daliaon Plantation",
    "Eden", "Kilate", "Lizada", "Lubogan", "Marapangi", "Mulig", "Sibulan", "Sirawan",
    "Tagluno", "Tagurano", "Tibuloy", "Toril Proper", "Tungkalan"
  ],
  Tugbok: [
    "Angalan", "Bago Oshiro", "Balenggaeng", "Biao Escuela", "Biao Guinga", "Los Amigos",
    "Manambulan", "Manuel Guianga", "Matina Biao", "Mintal", "New Carmen", "New Valencia",
    "Santo Niño", "Tacunan", "Tagakpan", "Talandang", "Tugbok Proper", "Ula"
  ]
};


const formState = observable({
  selectedDistrict: "",  // ✅ Store the selected Administrative District
  selectedBarangay: "",  // ✅ Store the selected Barangay
  filteredBarangays: [], // ✅ Store the list of barangays under the selected district
  showDistrictDropdown: false, // ✅ Controls district dropdown visibility
  showBarangayDropdown: false, // ✅ Controls barangay dropdown visibility
  sitio: "",
  householdNumber: "",
  householdNumberError: "",
  dateOfVisit: new Date(),
  showDatePicker: false,
  toilet: "Presence",
  toiletType: "",
  showToiletTypeInput: false,
  sourceOfWater: "Spring",
  customWaterSource: "", // ✅ Custom water source input
  showCustomWaterSourceInput: false, // ✅ Controls input visibility
  sourceOfIncomeMenuVisible: false,
  sourceOfIncome: "Full Time",
  customIncomeSource: "",
  showCustomIncomeInput: false,
  foodProductionVegetable: false, // ✅ Separate for Vegetable Garden
  foodProductionAnimals: false, // ✅ Separate for Raised Animals
  membership4Ps: false,
  loading: false,
});



const incomeOptions = ["Full Time", "Part Time", "Self Employed", "Other"];


import { useLocalSearchParams } from "expo-router";

const NewHouseholdForm = () => {
  const router = useRouter();
  const params = useLocalSearchParams(); // ✅ Get route parameters
  

  useEffect(() => {
    if (params?.reset === "true") {
      console.log("🧼 Reset triggered from params:", params);
      resetFormState(); // ✅ Only run once
    }
  }, []); // ✅ Empty dependency array prevents loop
  

 // ✅ Updates barangay list when district is selected
 const updateBarangays = (district) => {
  formState.selectedDistrict.set(district);
  formState.selectedBarangay.set(""); // ✅ Clear barangay field
  formState.filteredBarangays.set([]); // ✅ Ensure no barangays are displayed
  formState.showDistrictDropdown.set(false); // ✅ Close dropdown after selection
};


// ✅ Handles barangay search (prevents invalid entries)
// ✅ Handles barangay search (prevents invalid entries but does not clear immediately)
const handleBarangaySearch = (query) => {
  formState.selectedBarangay.set(query); // ✅ Update input field

  const district = formState.selectedDistrict.get();
  if (!district) return; // ✅ Ensure a district is selected before searching

  const barangayList = barangaysByDistrict[district] || [];

  // ✅ If the search bar is empty, do not show any results
  if (query.trim() === "") {
    formState.filteredBarangays.set([]);
    return;
  }

  // ✅ Filter barangays based on search query
  const filtered = barangayList.filter((barangay) =>
    barangay.toLowerCase().includes(query.toLowerCase())
  );

  formState.filteredBarangays.set(filtered); // ✅ Show filtered list
};



  // ✅ Move resetFormState inside the component
  const resetFormState = () => {
    formState.selectedDistrict.set("");
    formState.selectedBarangay.set("");
    formState.filteredBarangays.set([]);
    formState.showDistrictDropdown.set(false);
    formState.showBarangayDropdown.set(false);
    formState.sitio.set("");
    formState.householdNumber.set("");
    formState.householdNumberError.set("");
    formState.dateOfVisit.set(new Date());
    formState.showDatePicker.set(false);
    formState.toilet.set("Presence");
    formState.toiletType.set("");
    formState.showToiletTypeInput.set(false);
    formState.sourceOfWater.set("Spring");
    formState.customWaterSource.set("");
    formState.showCustomWaterSourceInput.set(false);
    formState.sourceOfIncome.set("Full Time");
    formState.customIncomeSource.set("");
    formState.showCustomIncomeInput.set(false);
    formState.foodProductionVegetable.set(false);
    formState.foodProductionAnimals.set(false);
    formState.membership4Ps.set(false);
    formState.loading.set(false);
  };
  
  

  const handleHouseholdNumberChange = (text) => {
    
    formState.householdNumber.set(text);
  };

  const validateForm = () => {
    const {
      sitio,
      householdNumber,
      dateOfVisit,
      toilet,
      sourceOfWater,
      sourceOfIncome,
      foodProductionVegetable,
      foodProductionAnimals,
      membership4Ps,
    } = formState.get();
  
    // ✅ Check required fields
    if (!sitio || !householdNumber || !dateOfVisit || !toilet || !sourceOfWater || !sourceOfIncome) {
      Alert.alert(
        "Missing Fields",
        "Please complete all required fields before proceeding."
      );
      return false;
    }
  
    // ✅ If "Other" is selected for Water Source but no input provided
    if (sourceOfWater === "Other" && !formState.customWaterSource.get().trim()) {
      Alert.alert(
        "Missing Input",
        "Please specify the 'Other' water source."
      );
      return false;
    }
  
    // ✅ If "Other" is selected for Income Source but no input provided
    if (sourceOfIncome === "Other" && !formState.customIncomeSource.get().trim()) {
      Alert.alert(
        "Missing Input",
        "Please specify the 'Other' source of income."
      );
      return false;
    }
  
    // ✅ If "Present" is selected for Toilet but no input provided
    if (toilet === "Presence" && !formState.toiletType.get().trim()) {
      Alert.alert(
        "Missing Input",
        "Please specify the type of toilet."
      );
      return false;
    }
  
    return true;
  };
  
  const handleSave = async () => {
    if (!validateForm()) return; // ✅ Stop execution if validation fails
  
    formState.loading.set(true);
  
    const data = {
      district: formState.selectedDistrict.get(),  // ✅ Save District
      barangay: formState.selectedBarangay.get(),  // ✅ Save Barangay
      sitio: formState.sitio.get(),
      householdnumber: formState.householdNumber.get(),
      dateofvisit: formState.dateOfVisit.get().toISOString().split("T")[0],
      toilet: formState.toilet.get() === "Presence"
        ? formState.toiletType.get() // ✅ Store toilet type if present
        : formState.toilet.get(),
      sourceofwater: formState.sourceOfWater.get() === "Other"
        ? formState.customWaterSource.get()
        : formState.sourceOfWater.get(),
      sourceofincome: formState.sourceOfIncome.get() === "Other"
        ? formState.customIncomeSource.get()
        : formState.sourceOfIncome.get(),
      foodproductionvegetable: formState.foodProductionVegetable.get() ? "Yes" : "No",
      foodproductionanimals: formState.foodProductionAnimals.get() ? "Yes" : "No",
      membership4ps: formState.membership4Ps.get() ? "Yes" : "No",
    };
  
    const householdId = await insertHousehold(data);
    if (!householdId) {
      formState.loading.set(false);
      Alert.alert("Error", "Failed to save household data.");
      return;
    }
  
    await syncWithSupabase();
    Alert.alert("Success", "Household data saved successfully!");
  
    formState.loading.set(false);
    router.push({ pathname: "/mealPattern", params: { householdId } });
  };
  

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
  <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
    <Icon name="arrow-back" size={24} color="#000" />
  </TouchableOpacity>
  <Text style={styles.header}>Household Information</Text>
</View>


      

     {/* Administrative District Selection */}
<Card style={styles.card}>
  <Card.Content>
    <Text style={styles.subHeader}>Administrative District</Text>
    <Menu
      visible={formState.showDistrictDropdown.get()}
      onDismiss={() => formState.showDistrictDropdown.set(false)}
      anchor={
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => formState.showDistrictDropdown.set(true)}
        >
          <Text>{formState.selectedDistrict.get() || "Select District"}</Text>
          <Icon name="keyboard-arrow-down" size={20} style={styles.dropdownIcon} />
        </TouchableOpacity>
      }
    >
      {Object.keys(barangaysByDistrict).map((district, index) => (
        <Menu.Item
          key={index}
          title={district}
          onPress={() => updateBarangays(district)}
        />
      ))}
    </Menu>
  </Card.Content>
</Card>


{/* Barangay Search Input */}
<Card style={styles.card}>
  <Card.Content>
    <TextInput
      label="Search Barangay"
      mode="outlined"
      value={formState.selectedBarangay.get()}
      onChangeText={handleBarangaySearch}
      style={styles.input}
      disabled={!formState.selectedDistrict.get()} // ✅ Prevent input before district selection
    />

    {/* ✅ Only show the list when there are search results */}
    {formState.filteredBarangays.get().length > 0 && (
      <View style={styles.dropdownContainer}>
        {formState.filteredBarangays.get().map((barangay, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dropdownItem}
            onPress={() => {
              formState.selectedBarangay.set(barangay);
              formState.filteredBarangays.set([]); // ✅ Hide list after selection
            }}
          >
            <Text>{barangay}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </Card.Content>
</Card>






      {/* Basic Information Card */}
      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Sitio/Purok"
            mode="outlined"
            value={formState.sitio.get()}
            onChangeText={formState.sitio.set}
            style={styles.input}
          />

          <TextInput
            label="Household No."
            mode="outlined"
            value={formState.householdNumber.get()}
            onChangeText={handleHouseholdNumberChange}
            keyboardType="numeric"
            style={styles.input}
          />
          {formState.householdNumberError.get() && (
            <Text style={styles.errorText}>{formState.householdNumberError.get()}</Text>
          )}

          <Text style={styles.subHeader}>Date of Visit:</Text>
          <TouchableOpacity onPress={() => formState.showDatePicker.set(true)}>
            <TextInput
              mode="outlined"
              value={formState.dateOfVisit.get().toDateString()}
              editable={false}
              style={styles.input}
              left={<TextInput.Icon icon="calendar" />}
            />
            </TouchableOpacity>

          {formState.showDatePicker.get() && (
            <DateTimePicker
              value={formState.dateOfVisit.get()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                formState.showDatePicker.set(false);
                if (selectedDate) formState.dateOfVisit.set(selectedDate);
              }}
            />
          )}
        </Card.Content>
      </Card>

      {/* Toilet & Water Source */}
      <Card style={styles.card}>
  <Card.Content>
    <Text style={styles.subHeader}>Sanitary Facilities:</Text>
    <SegmentedButtons
      value={formState.toilet.get()}
      onValueChange={(value) => {
        formState.toilet.set(value);
        formState.showToiletTypeInput.set(value === "Presence"); // ✅ Show/hide input field
      }}
      buttons={[
        { value: "Presence", label: "Present" },
        { value: "Absence", label: "Absent" },
      ]}
    />

    {/* ✅ Input field appears only if "Present" is selected */}
    {formState.showToiletTypeInput.get() && (
      <TextInput
        label="Specify Toilet Type"
        mode="outlined"
        value={formState.toiletType.get()}
        onChangeText={formState.toiletType.set}
        style={styles.input}
      />
    )}
<Text style={styles.subHeader}>Source of Water:</Text>
<SegmentedButtons
  value={formState.sourceOfWater.get()}
  onValueChange={(value) => {
    formState.sourceOfWater.set(value);
    formState.showCustomWaterSourceInput.set(value === "Other"); // ✅ Show input only if "Other" is selected
  }}
  buttons={[
    { value: "Spring", label: "Spring" },
    { value: "DCWD", label: "DCWD" },
    { value: "Tabay", label: "Tabay" },
    { value: "Other", label: "Other" }, // ✅ Added "Other" option
  ]}
/>

{/* ✅ Input field appears only if "Other" is selected */}
{formState.showCustomWaterSourceInput.get() && (
  <TextInput
    label="Specify Other Water Source"
    mode="outlined"
    value={formState.customWaterSource.get()}
    onChangeText={formState.customWaterSource.set}
    style={styles.input}
  />
)}
  </Card.Content>
</Card>


      {/* Source of Income & Membership */}
      <Card style={styles.card}>
        <Card.Content>
         
          <View>
  <Text style={styles.subHeader}>Source of Income:</Text>
  <Menu
    visible={formState.sourceOfIncomeMenuVisible.get()}
    onDismiss={() => formState.sourceOfIncomeMenuVisible.set(false)}
    anchor={
      <TouchableOpacity
      style={styles.dropdownButton}
      onPress={() => formState.sourceOfIncomeMenuVisible.set(true)}
    >
      <Text style={styles.dropdownText}>{formState.sourceOfIncome.get()}</Text>
      <Icon name="keyboard-arrow-down" size={20} style={styles.dropdownIcon} />
    </TouchableOpacity>
    
              
    }
  >
    {incomeOptions.map((option) => (
     <Menu.Item
     key={option}
     onPress={() => {
       formState.sourceOfIncome.set(option);
       formState.sourceOfIncomeMenuVisible.set(false);
   
       if (option === "Other") {
         formState.showCustomIncomeInput.set(true);  // Show the text input
       } else {
         formState.showCustomIncomeInput.set(false); // Hide the input if another option is selected
         formState.customIncomeSource.set("");       // Clear previous input
       }
     }}
     title={option}
   />
   
    ))}
  </Menu>
</View>
{formState.showCustomIncomeInput.get() && (
  <TextInput
    label="Specify Other Income Source"
    mode="outlined"
    value={formState.customIncomeSource.get()}
    onChangeText={formState.customIncomeSource.set}
    style={styles.input}
  />
)}


          <Divider style={{ marginVertical: 10 }} />

          <View style={styles.toggleRow}>
  <Text style={styles.subHeader}>Vegetable Garden:</Text>
  <Switch
    value={formState.foodProductionVegetable.get()}
    onValueChange={formState.foodProductionVegetable.set}
  />
</View>

<View style={styles.toggleRow}>
  <Text style={styles.subHeader}>Raised Animals for Food:</Text>
  <Switch
    value={formState.foodProductionAnimals.get()}
    onValueChange={formState.foodProductionAnimals.set}
  />
</View>


          <View style={styles.toggleRow}>
            <Text style={styles.subHeader}>4Ps Membership:</Text>
            <Switch
              value={formState.membership4Ps.get()}
              onValueChange={formState.membership4Ps.set}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Save Button */}
<Button 
  mode="contained" 
  style={styles.button} 
  buttonColor="#114ea9" // ✅ Change background color
  onPress={handleSave} 
  disabled={formState.loading.get()}
>
  {formState.loading.get() ? <ActivityIndicator color="white" /> : "Save & Next"}
</Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  subHeader: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
  input: { marginBottom: 12 },
  card: { marginBottom: 16, padding: 10, backgroundColor: "white", borderRadius: 10, elevation: 2 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 5 },
  button: { marginTop: 20, padding: 10},
  errorText: { color: "red", fontSize: 14 },

  // Updated dropdown styles to make it visible
  
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#007AFF", // Blue border
    borderRadius: 5,
    backgroundColor: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#007AFF", // Blue border
    borderRadius: 5,
    backgroundColor: "#fff",
    width: "100%", // Ensure full width
  },
  dropdownText: {
    fontSize: 16,
    color: "#000000", // Darker color for visibility
    flex: 1, // Ensures text is properly aligned
  },
  dropdownIcon: {
    width: 20,
    height: 20,
    tintColor: "#007AFF", // Dropdown icon color
  },
  headerContainer: {
    flexDirection: "row", // Arrange back button & title in a row
    alignItems: "center", // Align items vertically
    marginBottom: 16,
  },
  backButton: {
    marginRight: 10, // Space between back button and title
    padding: 8, // Increase touchable area for better usability
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1, // Allow text to be centered while button stays on the left
  },
  
});



export default observer(NewHouseholdForm);
