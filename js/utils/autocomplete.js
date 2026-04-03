/**
 * Reusable Autocomplete Component
 * Replaces <select> dropdowns with searchable live autocomplete inputs
 *
 * Usage:
 *   createAutocomplete({
 *     inputEl: document.getElementById('my-input'),
 *     items: [{ value: '1', label: 'Item One' }, ...],
 *     placeholder: 'Cari...',
 *     onSelect: (value, label) => { ... }
 *   });
 */
function createAutocomplete({ inputEl, items = [], placeholder = 'Cari...', onSelect, initialValue = '', initialLabel = '' }) {
    // Replace input with wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'ac-wrapper';
    wrapper.style.cssText = 'position:relative;width:100%;';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = inputEl.className;
    input.placeholder = placeholder;
    input.autocomplete = 'off';
    input.style.cssText = inputEl.style.cssText + 'width:100%;';
    input.setAttribute('data-value', initialValue);
    input.value = initialLabel;

    const dropdown = document.createElement('div');
    dropdown.className = 'ac-dropdown';
    dropdown.style.cssText = `
        position:absolute; top:calc(100% + 4px); left:0; right:0;
        background:#fff; border:1px solid var(--border); border-radius:12px;
        box-shadow:0 8px 24px rgba(0,0,0,0.1); z-index:9999;
        max-height:220px; overflow-y:auto; display:none;
    `;

    wrapper.appendChild(input);
    wrapper.appendChild(dropdown);
    inputEl.replaceWith(wrapper);

    let filtered = [...items];
    let activeIndex = -1;

    function renderDropdown(list) {
        if (list.length === 0) {
            dropdown.innerHTML = `<div style="padding:12px 16px;color:var(--text-muted);font-size:13px;">Tidak ditemukan</div>`;
        } else {
            dropdown.innerHTML = list.map((item, i) => `
                <div class="ac-item" data-value="${item.value}" data-index="${i}"
                    style="padding:10px 16px;cursor:pointer;font-size:14px;transition:background 0.15s;">
                    ${item.label}
                </div>
            `).join('');

            dropdown.querySelectorAll('.ac-item').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    dropdown.querySelectorAll('.ac-item').forEach(e => e.style.background = '');
                    el.style.background = 'var(--primary-surface)';
                });
                el.addEventListener('mouseleave', () => el.style.background = '');
                el.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    selectItem(el.dataset.value, el.textContent.trim());
                });
            });
        }
        dropdown.style.display = 'block';
        activeIndex = -1;
    }

    function selectItem(value, label) {
        input.value = label;
        input.setAttribute('data-value', value);
        dropdown.style.display = 'none';
        if (onSelect) onSelect(value, label);
    }

    function highlight(index) {
        const items = dropdown.querySelectorAll('.ac-item');
        items.forEach(el => el.style.background = '');
        if (items[index]) {
            items[index].style.background = 'var(--primary-surface)';
            items[index].scrollIntoView({ block: 'nearest' });
        }
    }

    input.addEventListener('input', () => {
        const q = input.value.toLowerCase();
        filtered = items.filter(i => i.label.toLowerCase().includes(q));
        renderDropdown(filtered);
    });

    input.addEventListener('focus', () => {
        filtered = [...items];
        renderDropdown(filtered);
    });

    input.addEventListener('keydown', (e) => {
        const acItems = dropdown.querySelectorAll('.ac-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, acItems.length - 1);
            highlight(activeIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            highlight(activeIndex);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && acItems[activeIndex]) {
                selectItem(acItems[activeIndex].dataset.value, acItems[activeIndex].textContent.trim());
            }
        } else if (e.key === 'Escape') {
            dropdown.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) dropdown.style.display = 'none';
    });

    // Public API
    return {
        getValue: () => input.getAttribute('data-value') || '',
        getLabel: () => input.value,
        setValue: (value, label) => selectItem(value, label),
        updateItems: (newItems) => { items = newItems; filtered = [...newItems]; }
    };
}

window.createAutocomplete = createAutocomplete;
