import React from "react";
import { Container, Grid, Paper, Typography, Box } from "@mui/material";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import PeopleIcon from "@mui/icons-material/People";
import LocalDiningIcon from "@mui/icons-material/LocalDining";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Dashboard = () => {
  // Sample data for dashboard statistics
  const stats = [
    { label: "Total Users", value: 150, icon: <PeopleIcon fontSize="large" /> },
    { label: "Meals Tracked", value: 1200, icon: <FastfoodIcon fontSize="large" /> },
    { label: "Active Diet Plans", value: 85, icon: <LocalDiningIcon fontSize="large" /> },
  ];

  // Bar Chart Data
  const barData = {
    labels: ["Carbs", "Protein", "Fats", "Fiber", "Vitamins"],
    datasets: [
      {
        label: "Daily Intake (g)",
        data: [250, 80, 60, 30, 20],
        backgroundColor: ["#1976D2", "#43A047", "#F57C00", "#D32F2F", "#7B1FA2"],
      },
    ],
  };

  // Doughnut Chart Data
  const doughnutData = {
    labels: ["Breakfast", "Lunch", "Dinner", "Snacks"],
    datasets: [
      {
        data: [30, 40, 20, 10],
        backgroundColor: ["#0288D1", "#FBC02D", "#7B1FA2", "#D32F2F"],
      },
    ],
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: 30 }}>
      {/* Dashboard Title */}
      <Typography variant="h4" gutterBottom>
        <DashboardIcon fontSize="large" /> NutriFile Dashboard
      </Typography>

      {/* Dashboard Stats Cards */}
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Paper elevation={3} style={{ padding: 20, display: "flex", alignItems: "center" }}>
              {stat.icon}
              <Box ml={2}>
                <Typography variant="h6">{stat.value}</Typography>
                <Typography variant="subtitle1">{stat.label}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} style={{ marginTop: 20 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: 20 }}>
            <Typography variant="h6">Nutrient Intake</Typography>
            <Bar data={barData} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: 20 }}>
            <Typography variant="h6">Meal Distribution</Typography>
            <Doughnut data={doughnutData} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
