import { fetchPlaceholders } from '../../scripts/placeholders.js';

export default async function decorate(block) {
    
    if (block.children.length >= 1) {
        const [blockContainer] = [...block.children];
        blockContainer.className = 'gmap-inner-container';

        const [blockList] = [...blockContainer.children];
        blockList.className = 'gmap-section';

        const gmapURL = blockList.querySelector('p').textContent;

        const gmapElm = `<iframe 
        width="100%" 
        height="100%" 
        frameborder="0" 
        style="border:0"
        src="${gmapURL}"
        </iframe>`;

        blockList.innerHTML = gmapElm;

    }
    
}