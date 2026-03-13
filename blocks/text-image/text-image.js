import { fetchPlaceholders } from '../../scripts/placeholders.js';

export default async function decorate(block) {
    
    if (block.children.length >= 1) {
        const [blockContainer] = [...block.children];
        blockContainer.className = 'text-image-container';

        const [textImageCol1, textImageCol2] = [...blockContainer.children];
        textImageCol1.className = 'text-image-col1';
        textImageCol2.className = 'text-image-col2';
    }
    
}