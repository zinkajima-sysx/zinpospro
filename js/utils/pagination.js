/**
 * Global Pagination Utility
 * Dipakai di semua tabel view
 */

/**
 * Render pagination HTML
 * @param {Object} opts - { currentPage, totalItems, rowsPerPage, onPageChange, containerId }
 */
function renderPagination({ currentPage, totalItems, rowsPerPage, onPageChange, containerId }) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const start = Math.min(totalItems, (currentPage - 1) * rowsPerPage + 1);
    const end   = Math.min(totalItems, currentPage * rowsPerPage);

    if (totalItems === 0) { container.innerHTML = ''; return; }

    let pages = '';
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            pages += `<button class="btn ${i === currentPage ? 'btn-primary' : 'btn-outline'} btn-sm"
                onclick="(${onPageChange})(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            pages += `<span style="padding:0 4px;color:var(--text-muted);">...</span>`;
        }
    }

    container.innerHTML = `
        <span class="text-muted" style="font-size:13px;">${start}–${end} dari ${totalItems} data</span>
        <div class="flex" style="gap:6px;">
            <button class="btn btn-outline btn-sm" ${currentPage === 1 ? 'disabled' : ''}
                onclick="(${onPageChange})(${currentPage - 1})">Prev</button>
            ${pages}
            <button class="btn btn-outline btn-sm" ${currentPage === totalPages ? 'disabled' : ''}
                onclick="(${onPageChange})(${currentPage + 1})">Next</button>
        </div>
    `;
}

/**
 * Render rows-per-page selector
 */
function renderRowsSelector({ current, onChange, containerId, options = [10, 25, 50, 100] }) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="flex" style="align-items:center;gap:8px;">
            <span style="font-size:12px;color:var(--text-muted);">Tampilkan</span>
            <select class="search-input" style="padding:5px 10px;width:75px;font-size:13px;"
                onchange="(${onChange})(parseInt(this.value))">
                ${options.map(o => `<option value="${o}" ${o === current ? 'selected' : ''}>${o}</option>`).join('')}
            </select>
            <span style="font-size:12px;color:var(--text-muted);">baris</span>
        </div>
    `;
}

/**
 * Paginate array
 */
function paginate(data, page, rowsPerPage) {
    const start = (page - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
}

window.renderPagination  = renderPagination;
window.renderRowsSelector = renderRowsSelector;
window.paginate          = paginate;
