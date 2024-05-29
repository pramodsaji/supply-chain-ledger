// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Contract to manage the supply chain of products
contract ProductSupplyChain {
    // Struct to store product details
    struct Product {
        uint productId;
        string productName;
        address owner;
    }

    // Struct to store ownership change details
    struct OwnershipChange {
        uint productId;
        address fromOwner;
        address toOwner;
        string comment;
    }

    // Admin address
    address public admin;

    // Lists of addresses for different roles
    address[] public manufacturers;
    address[] public shippers;
    address[] public wholesalers;
    address[] public retailers;

    // Array to store all products
    Product[] public products;
    OwnershipChange[] public ownershipChanges;

    // Counter for generating unique product IDs
    uint public lastProductId;

    // Event to log product addition
    event ProductAdded(
        uint indexed productId,
        string productName,
        address owner
    );

    // Function to add a new product
    function addProduct(uint _productId, string memory _productName) public {
        // Check if product with given ID already exists
        for (uint i = 0; i < products.length; i++) {
            require(
                products[i].productId != _productId,
                "Product with this ID already exists"
            );
        }

        // Add the product to the array
        products.push(Product(lastProductId, _productName, msg.sender));

        ownershipChanges.push(
            OwnershipChange(lastProductId, address(0), msg.sender, "Initial")
        );

        // Increment product ID counter
        lastProductId++;
    }

    // Function to get products based on owner
    function getProductsByOwner(
        address _owner
    ) public view returns (Product[] memory) {
        Product[] memory ownedProducts = new Product[](products.length);
        uint count = 0;

        // Iterate through products array and filter products owned by _owner
        for (uint i = 0; i < products.length; i++) {
            if (products[i].owner == _owner) {
                ownedProducts[count] = products[i];
                count++;
            }
        }

        // Define a new dynamic array to store the filtered products
        Product[] memory ownedProductsLatest = new Product[](count);

        // Iterate through products array and copy the filtered products to ownedProducts
        for (uint i = 0; i < count; i++) {
            ownedProductsLatest[i] = ownedProducts[i];
        }

        // Return the dynamic array slice containing the filtered products
        return ownedProductsLatest;
    }

    constructor() {
        admin = msg.sender;
    }

    function transferOwnership(uint _productId, address _newOwner) public {
        products[_productId].owner = _newOwner;

        ownershipChanges.push(
            OwnershipChange(_productId, msg.sender, _newOwner, "Transfer")
        );
    }

    // Function to find the type of stakeholder for a given address
    function findStakeholderType(
        address _address
    ) public view returns (string memory) {
        for (uint i = 0; i < manufacturers.length; i++) {
            if (manufacturers[i] == _address) {
                return "M"; // Manufacturer
            }
        }

        for (uint i = 0; i < shippers.length; i++) {
            if (shippers[i] == _address) {
                return "S"; // Shipper
            }
        }

        for (uint i = 0; i < wholesalers.length; i++) {
            if (wholesalers[i] == _address) {
                return "W"; // Wholesaler
            }
        }

        for (uint i = 0; i < retailers.length; i++) {
            if (retailers[i] == _address) {
                return "R"; // Retailer
            }
        }

        return "N"; // Not found
    }

    // Function to return the list of addresses based on the first letter of the stakeholder's role
    function getAddressesByStakeholderType(
        string memory stakeholderType
    ) public view returns (address[] memory) {
        bytes32 typeHash = keccak256(abi.encodePacked(stakeholderType));

        if (typeHash == keccak256("M")) {
            return manufacturers;
        } else if (typeHash == keccak256("S")) {
            return shippers;
        } else if (typeHash == keccak256("W")) {
            return wholesalers;
        } else if (typeHash == keccak256("R")) {
            return retailers;
        } else {
            return new address[](0);
        }
    }

    // Function to add a new address to the list of stakeholders
    function addStakeholder(
        address _address,
        string memory stakeholderType
    ) public {
        bytes32 typeHash = keccak256(abi.encodePacked(stakeholderType));

        if (typeHash == keccak256("M")) {
            manufacturers.push(_address);
        } else if (typeHash == keccak256("S")) {
            shippers.push(_address);
        } else if (typeHash == keccak256("W")) {
            wholesalers.push(_address);
        } else if (typeHash == keccak256("R")) {
            retailers.push(_address);
        }
    }

    // Function to remove an address from the list of stakeholders
    function removeStakeholder(
        address stakeholder,
        string memory stakeholderType
    ) public {
        if (keccak256(bytes(stakeholderType)) == keccak256(bytes("M"))) {
            // Remove from manufacturers list
            for (uint i = 0; i < manufacturers.length; i++) {
                if (manufacturers[i] == stakeholder) {
                    // Swap with the last element and remove
                    manufacturers[i] = manufacturers[manufacturers.length - 1];
                    manufacturers.pop();
                    break;
                }
            }
        } else if (keccak256(bytes(stakeholderType)) == keccak256(bytes("S"))) {
            // Remove from shippers list
            for (uint i = 0; i < shippers.length; i++) {
                if (shippers[i] == stakeholder) {
                    // Swap with the last element and remove
                    shippers[i] = shippers[shippers.length - 1];
                    shippers.pop();
                    break;
                }
            }
        } else if (keccak256(bytes(stakeholderType)) == keccak256(bytes("W"))) {
            // Remove from wholesalers list
            for (uint i = 0; i < wholesalers.length; i++) {
                if (wholesalers[i] == stakeholder) {
                    // Swap with the last element and remove
                    wholesalers[i] = wholesalers[wholesalers.length - 1];
                    wholesalers.pop();
                    break;
                }
            }
        } else if (keccak256(bytes(stakeholderType)) == keccak256(bytes("R"))) {
            // Remove from retailers list
            for (uint i = 0; i < retailers.length; i++) {
                if (retailers[i] == stakeholder) {
                    // Swap with the last element and remove
                    retailers[i] = retailers[retailers.length - 1];
                    retailers.pop();
                    break;
                }
            }
        }
    }

    // Function to get all products
    function getAllProducts() public view returns (Product[] memory) {
        return products;
    }

    // Function to find ownership change records based on productId
    function findRecordsByProductId(
        uint _productId
    ) public view returns (OwnershipChange[] memory) {
        // Temporary array to store matching records
        OwnershipChange[] memory matchingRecords = new OwnershipChange[](
            ownershipChanges.length
        );

        // Counter to track the number of matching records
        uint count = 0;

        // Iterate through ownershipChanges array to find matching records
        for (uint i = 0; i < ownershipChanges.length; i++) {
            if (ownershipChanges[i].productId == _productId) {
                // Increase the size of the matchingRecords array
                // and add the matching record to it
                matchingRecords[count] = ownershipChanges[i];
                count++;
            }
        }

        // Create a new array with the correct size to return the matching records
        OwnershipChange[] memory result = new OwnershipChange[](count);
        for (uint j = 0; j < count; j++) {
            result[j] = matchingRecords[j];
        }

        // Return the array of matching records
        return result;
    }
}
