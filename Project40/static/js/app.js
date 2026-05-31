function toggleForm(id) {
    var el = document.getElementById(id);
    if (el.style.display === 'none' || el.style.display === '') {
        el.style.display = 'block';
    } else {
        el.style.display = 'none';
    }
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function showEditVehicle(id, plate, vtype, capacity, driver, phone, status) {
    document.getElementById('edit_vehicle_id').value = id;
    document.getElementById('edit_license_plate').value = plate;
    document.getElementById('edit_vehicle_type').value = vtype;
    document.getElementById('edit_load_capacity').value = capacity;
    document.getElementById('edit_driver_name').value = driver;
    document.getElementById('edit_driver_phone').value = phone;
    document.getElementById('edit_status').value = status;
    document.getElementById('editVehicleForm').action = '/vehicles/' + id + '/update';
    document.getElementById('editVehicleModal').style.display = 'flex';
}

function showEditRoute(id, name, start, end, distance, time) {
    document.getElementById('edit_route_id').value = id;
    document.getElementById('edit_route_name').value = name;
    document.getElementById('edit_start_point').value = start;
    document.getElementById('edit_end_point').value = end;
    document.getElementById('edit_distance').value = distance;
    document.getElementById('edit_estimated_time').value = time;
    document.getElementById('editRouteForm').action = '/routes/' + id + '/update';
    document.getElementById('editRouteModal').style.display = 'flex';
}

window.onclick = function(event) {
    var modals = document.querySelectorAll('.modal');
    modals.forEach(function(modal) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
