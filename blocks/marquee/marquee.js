import { fetchPlaceholders } from '../../scripts/placeholders.js';

export default async function decorate(block) {
    
    if (block.children.length >= 1) {
        const [blockContainer] = [...block.children];
        blockContainer.className = 'marquee-container';

        const [blockList] = [...blockContainer.children];
        blockList.className = 'marquee-list';
    }
    
}