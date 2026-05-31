function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

function confirmDelete(formId) {
    if (confirm('确定要删除这条记录吗？此操作不可撤销。')) {
        document.getElementById(formId).submit();
    }
}

function editItem(id, name, category, stock, unit, description) {
    document.getElementById('edit_item_id').value = id;
    document.getElementById('edit_item_name').value = name;
    document.getElementById('edit_item_category').value = category;
    document.getElementById('edit_item_stock').value = stock;
    document.getElementById('edit_item_unit').value = unit;
    document.getElementById('edit_item_description').value = description;
    openModal('editItemModal');
}

function editEmployee(id, name, department, position, phone) {
    document.getElementById('edit_emp_id').value = id;
    document.getElementById('edit_emp_name').value = name;
    document.getElementById('edit_emp_department').value = department;
    document.getElementById('edit_emp_position').value = position;
    document.getElementById('edit_emp_phone').value = phone;
    openModal('editEmployeeModal');
}

function editBatch(id, name, description, batch_date, status) {
    document.getElementById('edit_batch_id').value = id;
    document.getElementById('edit_batch_name').value = name;
    document.getElementById('edit_batch_description').value = description;
    document.getElementById('edit_batch_date').value = batch_date;
    document.getElementById('edit_batch_status').value = status;
    openModal('editBatchModal');
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return dateStr;
}

document.addEventListener('DOMContentLoaded', function() {
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.addEventListener('input', function() {
            const filter = this.value.toLowerCase();
            const rows = document.querySelectorAll('.data-table tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(filter) ? '' : 'none';
            });
        });
    }
});
