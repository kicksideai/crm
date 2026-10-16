import surfaceCss from './surface.css?inline'

// Wippy web components render in a shadow root, so every style they need travels
// through this one source-owned stylesheet.
export const crmStyles = surfaceCss
