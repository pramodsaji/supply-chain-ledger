// Import necessary libraries
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import SupplyChainContract from "../contracts/SupplyChainContract.json";

// Define the EthereumAuthentication component
export function EthereumAuthentication() {
  const [web3, setWeb3] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState(null);
  const [stakeholderType, setStakeholderType] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  var contract = null;

  // Initialize the Web3 instance
  const initWeb3 = async () => {
    try {
      // Check if MetaMask is installed
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // Check if user is already authenticated
        const accs = await web3Instance.eth.getAccounts();
        if (accs.length > 0) {
          setAddress(accs[0]);
          localStorage.setItem("address", accs[0]);
          getStakeholderType();
        }
        setLoading(false);
      } else {
        console.log("MetaMask not detected");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error initializing Web3:", error);
      setLoading(false);
    }
  };

  // Handle the login event
  useEffect(() => {
    initWeb3();
  }, []);

  // Function to handle the login event
  const handleLogin = async () => {
    try {
      // Request access to user accounts
      const accs = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      // Set the list of user accounts in state
      setAddress(accs[0]);
      localStorage.setItem("address", accs[0]);

      getStakeholderType();
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  // Function to retrieve the stakeholder type for the current user
  const getStakeholderType = async () => {
    var web3 = new Web3(
      new Web3.providers.HttpProvider("http://localhost:8545")
    );
    try {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SupplyChainContract.networks[networkId];
      contract = new web3.eth.Contract(
        SupplyChainContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      const stakeholder = await contract.methods
        .findStakeholderType(localStorage.getItem("address"))
        .call({
          from: localStorage.getItem("address"),
        });
      console.log(stakeholder);
      setStakeholderType(stakeholder);

      if (stakeholder === "A") setIsAdmin(true);
      else setIsAdmin(false);

      localStorage.setItem("stakeholderType", stakeholder);
    } catch (error) {
      console.error("Error retrieving data:", error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!web3) {
    return (
      <div>
        MetaMask not detected. Please install MetaMask to use this feature.
      </div>
    );
  }

  if (address === null || address === "") {
    return (
      <div>
        <button onClick={handleLogin}>Connect with MetaMask</button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <span className="home-link">
          <a href="/">Home</a>
          <span>&nbsp;&nbsp;</span>
          {["M", "R", "S", "W"].includes(stakeholderType) && (
            <a href="/view">Products</a>
          )}
          {stakeholderType === "A" && <a href="/admin">Admin Dashboard</a>}
        </span>

        <center>
          <h2>Supply Chain Ledger</h2>
        </center>
      </div>
      <p>Connected Id: {address}</p>
    </div>
  );
}

export default EthereumAuthentication;
