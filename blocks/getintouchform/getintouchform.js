import { fetchPlaceholders } from '../../scripts/placeholders.js';

export default async function decorate(block) {
    
    if (block.children.length >= 1) {
        const [blockContainer, formContainer] = [...block.children];
        blockContainer.className = 'getintouch-container';
        formContainer.className = 'customform-wrapper';

        const [formblock] = [...formContainer.children];
        formblock.className = 'customform block';
        formblock.blockName = 'customform';

        const [blockList] = [...blockContainer.children];
        blockList.className = 'text-section';

    }
    
}