# CRM web components

The CRM frontend is delivered as shadow-DOM web components. Dialogs and popup controls stay inside that shadow root so their theme, focus, and event boundaries remain attached to the component. PrimeVue overlay components are not used here because they teleport their panels to `document.body`, outside the owning shadow root.

The local controls are limited to CRM-specific interactions: schema editors, the asynchronous record combobox, filter criteria, and column visibility. Dialogs expose modal semantics, initial focus, Escape dismissal, focus wrapping, and focus restoration. The record picker implements the ARIA combobox/listbox contract; simple choices use native `select` elements.
