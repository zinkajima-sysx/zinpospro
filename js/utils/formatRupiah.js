/**
 * Rupiah Input Formatter
 * Converts numeric input to thousand-separated format (e.g. 200000 → 200.000)
 */

function formatRupiahInput(input) {
    // Remove all non-digit characters
    let raw = input.value.replace(/\D/g, '');
    // Format with dot separator
    input.value = raw ? parseInt(raw).toLocaleString('id-ID') : '';
    // Store raw numeric value in dataset
    input.dataset.rawValue = raw || '0';
}

function getRawValue(input) {
    return parseFloat(input.dataset.rawValue || input.value.replace(/\./g, '') || '0');
}

function applyRupiahFormatter(selector = '.rupiah-input') {
    document.querySelectorAll(selector).forEach(input => {
        // Format existing value on init
        if (input.value) {
            const raw = input.value.replace(/\D/g, '');
            input.dataset.rawValue = raw;
            input.value = raw ? parseInt(raw).toLocaleString('id-ID') : '';
        }
        input.addEventListener('input', () => formatRupiahInput(input));
        input.addEventListener('focus', () => {
            // Show raw number on focus for easier editing
            input.value = input.dataset.rawValue || '';
        });
        input.addEventListener('blur', () => {
            formatRupiahInput(input);
        });
    });
}

window.formatRupiahInput = formatRupiahInput;
window.getRawValue = getRawValue;
window.applyRupiahFormatter = applyRupiahFormatter;
