const registerTab = document.getElementById('register_tab');
const scanTab = document.getElementById('scan_tab');
const viewTab = document.getElementById('view_tab');
const generateTab = document.getElementById('generate_tab');

registerTab.addEventListener('click', () => {
    displayTab('register');
});

scanTab.addEventListener('click', () => {
    displayTab('scan');
});

viewTab.addEventListener('click', () => {
    displayTab('view');
});

generateTab.addEventListener('click', () => {
    displayTab('generate');
});
function displayTab(tabName) {
    const contents = document.querySelectorAll('.tab_content');
    contents.forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    if (tabName === 'view') {
        displayAttendanceRecords();
    } else if (tabName === 'generate') {
        addStudentSelect();
    }
}

let students = [];

document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const student = {
        id: document.getElementById('studentId').value,
        name: document.getElementById('studentName').value,
        email: document.getElementById('studentEmail').value,
        class: document.getElementById('studentClass').value,
        registeredDate: new Date().toLocaleString()
    };

    if (students.find(s => s.id === student.id)) {
        alert('Student ID already exists!');
        return;
    }
    students.push(student);
    alert('Student registered Successfully !');
    this.reset();
});
function addStudentSelect() {
    const select = document.getElementById('selectStudent');
    let Options = '<option value="">Select a Student</option>';
    students.forEach(student => {
        Options += `<option value="${student.id}">${student.name} (${student.id})</option>`;
    });
    select.innerHTML = Options;
}
document.getElementById('Qr_generate').addEventListener('click', () => {
    generateQRCode();
});
function generateQRCode(){
    const studentId = document.getElementById('selectStudent').value;
    if (studentId == "" || studentId == null) {
        alert('Please select a student first!');
        return;
    }

    const student = students.find(s => s.id === studentId);
    const qrData = JSON.stringify({
        id: student.id,
        name: student.name,
        type: 'attendance'
    });
    document.getElementById('qrcode').innerHTML = '';
    new QRCode(document.getElementById('qrcode'), {
        text: qrData,
        width: 256,
        height: 256,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
    document.getElementById('studentInfo').style.display = 'block';
    document.getElementById('studentInfo').innerHTML = `
                <h3>Student Information</h3>
                <p>ID:${student.id}</p>
                <p>Name:${student.name}</p>
                <p>Email:${student.email}</p>
                <p>Class:${student.class}</p>
            `;

document.getElementById('downloadQR').style.display = 'inline-block';
}
document.getElementById('downloadQR').addEventListener('click',()=>{
    downloadQR();
})
function downloadQR() {
    const qrContainer = document.getElementById('qrcode');
    const img = qrContainer.querySelector('img');
    if (img) {
        const link = document.createElement('a');
        link.href = img.src;
        link.download = 'student_qr.png';
        link.click();
    } else {
        alert("Image not ready yet!");
    }
}

document.getElementById('startScanner').addEventListener('click',()=>{
    startScanner();
    document.getElementById('startScanner').style.display='none';
    document.getElementById('stopScanner').style.display='block';
})

let attendanceRecords = [];
let html5QrcodeScanner;

function startScanner() {
    html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    
    html5QrcodeScanner.render((decodedText) => {
        try {
            const data = JSON.parse(decodedText);
            if (data.type === 'attendance') {
                const isAlreadyMarked = attendanceRecords.some(record => record.id === data.id);
                if (isAlreadyMarked) {
                    stopScanner();
                    setTimeout(() => {
                        alert(`Attendance already marked for ${data.name} today.`);
                    }, 100);
                    return;
                }
                attendanceRecords.push({
                    id: data.id,
                    name: data.name,
                    time: new Date().toLocaleString()
                });
                stopScanner();
                setTimeout(() => {
                    alert(`Attendance marked for ${data.name}`);
                }, 100);
            }
        } catch (e) {
            stopScanner();
            alert("This QR code is not recognized by the Attendance System.");
        }
    });
}
document.getElementById('stopScanner').addEventListener('click',()=>{
    stopScanner();
})
function stopScanner(){
    html5QrcodeScanner.clear(); 
    document.getElementById('stopScanner').style.display = 'none';
    document.getElementById('startScanner').style.display = 'block';
}
function displayAttendanceRecords() {
    const tableBody = document.getElementById('attendanceBody');
    const tableElement = document.getElementById('recordsTable');
    const noRecordsMsg = document.getElementById('noRecordsMsg');

    tableBody.innerHTML = "";
    if (attendanceRecords.length === 0) {
        tableElement.style.display = "none";
        noRecordsMsg.style.display = "block";
        return;
    }
    tableElement.style.display = "table";
    noRecordsMsg.style.display = "none";
    let rowsHtml = "";
    attendanceRecords.forEach(record => {
        rowsHtml += `
            <tr>
                <td>${record.id}</td>
                <td>${record.name}</td>
                <td>${record.time}</td>
            </tr>`;
    });
    tableBody.innerHTML = rowsHtml;
}

