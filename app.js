document.getElementById('inventory-form').addEventListener('submit', addItem);
document.getElementById('freeze-button').addEventListener('click', freezeInventory);
document.getElementById('seal-button').addEventListener('click', sealInventory);
document.getElementById('prevent-extensions-button').addEventListener('click', preventExtensions);

const inventory = {};

function updateInventoryDisplay() {
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = '';
    for (const [key, value] of Object.entries(inventory)) {
        const item = document.createElement('div');
        item.className = 'inventory-item flex justify-between items-center bg-gray-100 p-4 mb-2 rounded-md shadow-sm';
        item.innerHTML = `<span>${key}: ${value.quantity}</span>
                          <div>
                            <button class="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2" onclick="editItem('${key}')">Edit</button>
                            <button class="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400" onclick="deleteItem('${key}')">Delete</button>
                          </div>`;
        inventoryList.appendChild(item);
    }
    displayInventoryDetails();
}

function addItem(event) {
    event.preventDefault();
    const name = document.getElementById('item-name').value;
    const quantity = parseInt(document.getElementById('item-quantity').value, 10);

    if (!Object.isExtensible(inventory)) {
        alert('Inventory is not extensible. Cannot add new items.');
        return;
    }

    if (Object.hasOwn(inventory, name)) {
        if (Object.isFrozen(inventory[name])) {
            alert('Item is frozen. Cannot modify.');
            return;
        }
        inventory[name].quantity += quantity;
        alert(`Updated ${name}'s quantity to ${inventory[name].quantity}.`);
    } else {
        Object.defineProperties(inventory, {
            [name]: {
                value: { quantity: quantity },
                writable: true,
                enumerable: true,
                configurable: true
            }
        });
        alert(`Added new item: ${name} with quantity ${quantity}.`);
    }
    updateInventoryDisplay();
}

function deepFreezeIterative(object) { 
    const stack = [object];

    while (stack.length) {
        const current = stack.pop();
        const propNames = Object.getOwnPropertyNames(current);

        Object.freeze(current);

        for (const name of propNames) {
            const prop = current[name];
            if (typeof prop === 'object' && prop !== null && !Object.isFrozen(prop)) {
                stack.push(prop);
            }
        }
    }

    return object;
}

function freezeInventory() {
    deepFreezeIterative(inventory);
    alert('Inventory has been frozen. No further modifications allowed.');
    updateInventoryDisplay();
}

function sealInventory() {
    Object.seal(inventory);
    alert('Inventory has been sealed. No further additions or deletions allowed, but modifications are still possible.');
    updateInventoryDisplay();
}

function preventExtensions() {
    Object.preventExtensions(inventory);
    alert('Inventory is now non-extensible. No new items can be added.');
    updateInventoryDisplay();
}

function editItem(name) {
    const newQuantity = prompt(`Enter new quantity for ${name}:`, inventory[name].quantity);
    if (newQuantity !== null) {
        if (Object.isFrozen(inventory[name])) {
            alert('Item is frozen. Cannot modify.');
            return;
        }
        inventory[name].quantity = parseInt(newQuantity, 10);
        alert(`Updated ${name}'s quantity to ${inventory[name].quantity}.`);
        updateInventoryDisplay();
    }
}

function deleteItem(name) {
    if (Object.isSealed(inventory)) {
        alert('Inventory is sealed. Cannot delete items.');
        return;
    }
    if (Object.hasOwn(inventory, name)) {
        delete inventory[name];
        alert(`Deleted item: ${name}.`);
        updateInventoryDisplay();
    }
}

function displayInventoryDetails() {
    console.log('Keys:', Object.keys(inventory));
    console.log('Values:', Object.values(inventory));
    console.log('Entries:', Object.entries(inventory));
}

function logPropertyDescriptors(itemName) {
    if (Object.hasOwn(inventory, itemName)) {
        console.log('Descriptor:', Object.getOwnPropertyDescriptor(inventory, itemName));
        console.log('All Descriptors:', Object.getOwnPropertyDescriptors(inventory));
    }
}
