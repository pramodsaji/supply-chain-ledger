// Import necessary libraries
import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Web3 from "web3";
import SupplyChainContract from "../contracts/SupplyChainContract.json";

import ProductDetails from "./ProductDetails";

// Define the ViewProducts component
export function ViewProducts() {
  const [products, setProducts] = useState([]);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [openAddProduct, setOpenAddProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(0);
  const [selectedStakeholder, setSelectedStakeholder] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [newProductName, setNewProductName] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);

  // Function to handle product name click and set the selectedProductId
  const handleProductNameClick = (productId) => {
    setSelectedProduct(productId);
  };

  var contract = null;
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  useEffect(() => {
    getProductsByOwner();
  }, []);

  useEffect(() => {
    getAddressesByStakeholderType();
  }, [selectedStakeholder]);

  // Function to open the transfer dialog
  const openTransferDialog = (productId) => {
    setSelectedProductId(productId);
    setOpenTransfer(true);
  };

  // Function to open the add product dialog
  const openAddDialog = () => {
    setOpenAddProduct(true);
  };

  // Function to get addresses by stakeholder type
  const getAddressesByStakeholderType = async () => {
    try {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SupplyChainContract.networks[networkId];
      contract = new web3.eth.Contract(
        SupplyChainContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      // Get the list of addresses for the selected stakeholder type
      const addressList = await contract.methods
        .getAddressesByStakeholderType(selectedStakeholder)
        .call({
          from: localStorage.getItem("address"),
        });
      setAddresses(addressList);
    } catch (error) {
      console.error("Error retrieving data:", error.message);
    }
  };

  // Function to handle the selected stakeholder change
  const selectedStakeholderChange = (stakeholder) => {
    setSelectedStakeholder(stakeholder);
  };

  // Function to fetch products for the specified stakeholder
  const getProductsByOwner = async () => {
    try {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SupplyChainContract.networks[networkId];
      contract = new web3.eth.Contract(
        SupplyChainContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      // Get the list of products for the current user
      const productList = await contract.methods
        .getProductsByOwner(localStorage.getItem("address"))
        .call({
          from: localStorage.getItem("address"),
          gas: 5000000,
        });
      setProducts(productList);
    } catch (error) {
      console.error("Error retrieving data:", error.message);
    }
  };

  // Function to handle the transfer of a product
  const handleTransfer = async () => {
    try {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SupplyChainContract.networks[networkId];
      contract = new web3.eth.Contract(
        SupplyChainContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      // Transfer the product to the selected address
      await contract.methods
        .transferOwnership(selectedProductId, selectedAddress, "")
        .send({
          from: localStorage.getItem("address"),
          gas: 3000000,
        });
    } catch (error) {
      console.error("Error retrieving data:", error.message);
    }

    // Close the popup
    setOpenTransfer(false);
  };

  const handleAddProduct = async () => {
    try {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SupplyChainContract.networks[networkId];
      contract = new web3.eth.Contract(
        SupplyChainContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      await contract.methods.addProduct(22, newProductName).send({
        from: localStorage.getItem("address"),
        gas: 5000000,
      });
    } catch (error) {
      console.error("Error retrieving data:", error.message);
    }
    setOpenAddProduct(false);
  };

  // Render the component
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Your Products
      </Typography>
      <Button onClick={openAddDialog} variant="contained" color="primary">
        Add Product
      </Button>
      {products.length === 0 ? (
        <Typography variant="body1">No products found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="products table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={parseInt(product[0])}>
                  <TableCell component="th" scope="row">
                    <button
                      onClick={() =>
                        handleProductNameClick(parseInt(product[0]))
                      }
                    >
                      {product[1]}
                    </button>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      onClick={() => openTransferDialog(parseInt(product[0]))}
                    >
                      Transfer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={openTransfer} onClose={() => setOpenTransfer(false)}>
        <DialogTitle>Transfer Product</DialogTitle>
        <DialogContent>
          <Select
            value={selectedStakeholder}
            onChange={(e) => selectedStakeholderChange(e.target.value)}
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select Stakeholder
            </MenuItem>
            <MenuItem value="M">Manufacturer</MenuItem>
            <MenuItem value="S">Shipper</MenuItem>
            <MenuItem value="W">Wholesaler</MenuItem>
            <MenuItem value="R">Retailer</MenuItem>
          </Select>
          <Select
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            fullWidth
            displayEmpty
            style={{ marginTop: "10px" }}
          >
            <MenuItem value="" disabled>
              Select Address
            </MenuItem>
            {addresses.map((address) => (
              <MenuItem key={address} value={address}>
                {address}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTransfer} variant="contained" color="primary">
            Transfer
          </Button>
          <Button
            onClick={() => setOpenTransfer(false)}
            variant="contained"
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAddProduct} onClose={() => setOpenAddProduct(false)}>
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Product Name"
            variant="outlined"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            fullWidth
            style={{ marginBottom: "10px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleAddProduct}
            variant="contained"
            color="primary"
          >
            Add
          </Button>
          <Button
            onClick={() => setOpenAddProduct(false)}
            variant="contained"
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <ProductDetails productId={selectedProduct} />
    </div>
  );
}

export default ViewProducts;
