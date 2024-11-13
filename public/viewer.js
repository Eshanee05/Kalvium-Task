const socket = io(); // Initialize the Socket.IO client

let pdfDoc = null;  // Store the PDF document
let currentPage = 1; // Start from the first page
let totalPages = 0; // To keep track of total pages

// Set up PDF.js to render the PDF
pdfjsLib.getDocument('/care.pdf').promise.then(function (pdf) {
    pdfDoc = pdf;
    totalPages = pdf.numPages;
    renderPage(currentPage);
});

function renderPage(pageNum) {
    pdfDoc.getPage(pageNum).then(function (page) {
        const scale = 1.5;
        const viewport = page.getViewport({ scale: scale });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        document.getElementById('pdfViewer').innerHTML = ''; // Clear any previous content
        document.getElementById('pdfViewer').appendChild(canvas);

        page.render({ canvasContext: ctx, viewport: viewport });

        // Update page number display
        document.getElementById('pageNumber').textContent = pageNum;
        toggleButtons();
    });
}

function toggleButtons() {
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Handle "Previous" and "Next" button actions
document.getElementById('prevPage').addEventListener('click', function () {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
        socket.emit('pageChange', currentPage);  // Emit the page change event to the server
    }
});

document.getElementById('nextPage').addEventListener('click', function () {
    if (currentPage < totalPages) {
        currentPage++;
        renderPage(currentPage);
        socket.emit('pageChange', currentPage);  // Emit the page change event to the server
    }
});

// Listen for page changes from other viewers
socket.on('pageChange', function (pageNum) {
    currentPage = pageNum;
    renderPage(currentPage);
});
