// Import necessary libraries
import React, { useState, useEffect } from "react";
import SupplyChainContract from "../contracts/SupplyChainContract.json";
import Web3 from "web3";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

// Define the AdminDashboard component
export function AdminDashboard() {
  // Initialize state variables
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  const [selectedStakeholder, setSelectedStakeholder] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState("");

  var contract = null;

  // Load the addresses for the selected stakeholder type
  useEffect(() => {
    getAddressesByStakeholderType();
  }, [selectedStakeholder]);

  // Handle the change event for the stakeholder dropdown
  const handleStakeholderChange = (event) => {
    setSelectedStakeholder(event.target.value);
  };

  // Retrieve the addresses for the selected stakeholder type
  const getAddressesByStakeholderType = async () => {
    try {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SupplyChainContract.networks[networkId];
      contract = new web3.eth.Contract(
        SupplyChainContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      // Retrieve the addresses for the selected stakeholder type
      const addressList = await contract.methods
        .getAddressesByStakeholderType(selectedStakeholder)
        .call({
          from: localStorage.getItem("address"),
        });
      // Update the addresses list
      setAddresses(addressList);
    } catch (error) {
      console.error("Error retrieving data:", error.message);
    }
  };

  // Add a new address for the selected stakeholder type
  const handleAddAddress = async (event) => {
    try {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SupplyChainContract.networks[networkId];
      contract = new web3.eth.Contract(
        SupplyChainContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      // Add the new address for the selected stakeholder type
      await contract.methods
        .addStakeholder(newAddress, selectedStakeholder)
        .send({
          from: localStorage.getItem("address"),
          gas: 3000000,
        });
    } catch (error) {
      console.error("Error retrieving data:", error.message);
    }
    // Reload the addresses for the selected stakeholder type
    getAddressesByStakeholderType();
  };

  // Delete the specified address for the selected stakeholder type
  const handleDeleteAddress = async (address, selectedStakeholder1) => {
    try {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SupplyChainContract.networks[networkId];
      contract = new web3.eth.Contract(
        SupplyChainContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      // Remove the specified address for the selected stakeholder type
      await contract.methods
        .removeStakeholder(address, selectedStakeholder1)
        .send({
          from: localStorage.getItem("address"),
        });
    } catch (error) {
      console.error("Error retrieving data:", error.message);
    }
    // Reload the addresses for the selected stakeholder type
    getAddressesByStakeholderType();
  };

  //  Render the AdminDashboard component
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome to the Admin Dashboard where we can manage stakeholders</p>
      <div>
        <label htmlFor="stakeholder">Select Stakeholder:</label>
        <FormControl fullWidth>
          <InputLabel id="stakeholder-label">Select Stakeholder</InputLabel>
          <Select
            labelId="stakeholder-label"
            id="stakeholder"
            value={selectedStakeholder}
            label="Select Stakeholder"
            style={{ width: "200px" }}
            onChange={handleStakeholderChange}
          >
            <MenuItem value="">
              <em>Select...</em>
            </MenuItem>
            <MenuItem value="M">Manufacturer</MenuItem>
            <MenuItem value="S">Shipper</MenuItem>
            <MenuItem value="W">Wholesaler</MenuItem>
            <MenuItem value="R">Retailer</MenuItem>
          </Select>
        </FormControl>
        <br />
        <br></br>
        <div style={{ display: "flex", alignItems: "center" }}>
          <TextField
            label="New Address"
            variant="outlined"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddAddress}
            style={{ marginLeft: "10px" }}
          >
            Add
          </Button>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Address</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {addresses.map((address, index) => (
              <TableRow key={index}>
                <TableCell>{address}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() =>
                      handleDeleteAddress(address, selectedStakeholder)
                    }
                    aria-label="delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default AdminDashboard;
