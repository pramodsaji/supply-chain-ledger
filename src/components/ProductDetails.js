import React, { useEffect, useState } from "react";
import SupplyChainContract from "../contracts/SupplyChainContract.json";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import Web3 from "web3";

function ProductDetails({ productId }) {
  const [productDetails, setProductDetails] = useState(null);

  var contract = null;
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  useEffect(() => {
    // Fetch product details based on productId when it changes
    if (productId !== null) {
      // Assuming you have an API endpoint to fetch product details by productId
      fetchProductDetails(productId);
    }
  }, [productId]);

  // Function to fetch product details from API
  const fetchProductDetails = async (productId) => {
    try {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SupplyChainContract.networks[networkId];
      contract = new web3.eth.Contract(
        SupplyChainContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      console.log(productId);
      // Get the list of addresses for the selected stakeholder type
      const ownershipDetail = await contract.methods
        .findRecordsByProductId(productId)
        .call({
          from: localStorage.getItem("address"),
          gas: 3000000,
        });
      setProductDetails(ownershipDetail);
      console.log(ownershipDetail);
    } catch (error) {
      console.error("Error retrieving data:", error.message);
    }
  };

  // Render product details
  return (
    <div>
      <h2>Product Details</h2>
      {productDetails ? (
        <div>
          <TableContainer component={Paper}>
            <Table aria-label="comment table">
              <TableHead>
                <TableRow>
                  <TableCell>From Owner</TableCell>
                  <TableCell>To Owner</TableCell>
                  <TableCell>Comment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productDetails.map((comment, index) => (
                  <TableRow key={index}>
                    <TableCell>{comment.fromOwner}</TableCell>
                    <TableCell>{comment.toOwner}</TableCell>
                    <TableCell>{comment.comment}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ) : (
        <p>No product selected</p>
      )}
    </div>
  );
}

export default ProductDetails;
