document.getElementById('inventory-form').addEventListener('submit', addItem);
document.getElementById('freeze-button').addEventListener('click', freezeInventory);
document.getElementById('unfreeze-button').addEventListener('click', unfreezeInventory);
document.getElementById('seal-button').addEventListener('click', sealInventory);
document.getElementById('prevent-extensions-button').addEventListener('click', preventExtensions);

let inventory = {};

function updateInventoryDisplay() {
    const inventoryTbody = document.getElementById('inventory-tbody');
    inventoryTbody.innerHTML = '';
    for (const [key, value] of Object.entries(inventory)) {
        const row = document.createElement('tr');
        row.className = 'bg-gray-50 hover:bg-gray-100 transition duration-200';
        row.innerHTML = `
            <td class="border px-4 py-2">${key}</td>
            <td class="border px-4 py-2">${value.quantity}</td>
            <td class="border px-4 py-2">
                <button class="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2" onclick="editItem('${key}')">Edit</button>
                <button class="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400" onclick="deleteItem('${key}')">Delete</button>
            </td>
        `;
        inventoryTbody.appendChild(row);
    }
    displayInventoryDetails();
}

function addItem(event) {
    event.preventDefault();
    const name = document.getElementById('item-name').value;
    const quantity = parseInt(document.getElementById('item-quantity').value, 10);

    if (!Object.isExtensible(inventory)) {
        Swal.fire('Error', 'Inventory is not extensible. Cannot add new items.', 'error');
        return;
    }

    if (Object.hasOwn(inventory, name)) {
        if (Object.isFrozen(inventory[name])) {
            Swal.fire('Error', 'Item is frozen. Cannot modify.', 'error');
            return;
        }
        inventory[name].quantity += quantity;
        Swal.fire('Success', `Updated ${name}'s quantity to ${inventory[name].quantity}.`, 'success');
    } else {
        Object.defineProperties(inventory, {
            [name]: {
                value: { quantity: quantity },
                writable: true,
                enumerable: true,
                configurable: true
            }
        });
        Swal.fire('Success', `Added new item: ${name} with quantity ${quantity}.`, 'success');
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

function cloneInventory(inventory) {
    const newInventory = {};
    for (const [key, value] of Object.entries(inventory)) {
        newInventory[key] = { ...value };
    }
    return newInventory;
}

function freezeInventory() {
    deepFreezeIterative(inventory);
    Swal.fire('Success', 'Inventory has been frozen. No further modifications allowed.', 'success');
    updateInventoryDisplay();
}

function unfreezeInventory() {
    inventory = cloneInventory(inventory);
    Swal.fire('Success', 'Inventory has been unfrozen. Modifications are now allowed.', 'success');
    updateInventoryDisplay();
}

function sealInventory() {
    Object.seal(inventory);
    Swal.fire('Success', 'Inventory has been sealed. No further additions or deletions allowed, but modifications are still possible.', 'success');
    updateInventoryDisplay();
}

function preventExtensions() {
    Object.preventExtensions(inventory);
    Swal.fire('Success', 'Inventory is now non-extensible. No new items can be added.', 'success');
    updateInventoryDisplay();
}

function editItem(name) {
    Swal.fire({
        title: `Enter new quantity for ${name}:`,
        input: 'number',
        inputValue: inventory[name].quantity,
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            if (Object.isFrozen(inventory[name])) {
                Swal.fire('Error', 'Item is frozen. Cannot modify.', 'error');
                return;
            }
            inventory[name].quantity = parseInt(result.value, 10);
            Swal.fire('Success', `Updated ${name}'s quantity to ${inventory[name].quantity}.`, 'success');
            updateInventoryDisplay();
        }
    });
}

function deleteItem(name) {
    if (Object.isSealed(inventory)) {
        Swal.fire('Error', 'Inventory is sealed. Cannot delete items.', 'error');
        return;
    }
    if (Object.hasOwn(inventory, name)) {
        delete inventory[name];
        Swal.fire('Success', `Deleted item: ${name}.`, 'success');
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
