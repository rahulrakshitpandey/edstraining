/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

export default function decorate(block) {
  const imageWrapper = document.createElement('div');
    [...block.children].forEach((row) => {
      // decorate accordion item label
      const label = row.children[0];
      
      const summary = document.createElement('summary');
      summary.className = 'accordion-item-label';
      summary.append(...label.childNodes);
      // decorate accordion item body
      const body = row.children[1];
      body.className = 'accordion-item-body';
      // decorate accordion item
      const details = document.createElement('details');
      details.className = 'accordion-item';
      details.append(summary, body);

      const imageWithAccordion = !!block.closest('.image-with-accordion');

      if(body.children.length === 0 && imageWithAccordion) {
        imageWrapper.classList = 'accordion-image';
        details.classList.add('no-content');
        const imageTag = summary.querySelector('picture');
        if(imageTag) {
          imageWrapper.innerHTML = imageTag.innerHTML;
          block.closest('.accordion-wrapper').append(imageWrapper);
          imageTag.remove();
        }
      }
      row.replaceWith(details);
    });

    if(imageWrapper) { 
      block.querySelector('.accordion-item:not(.no-content)').setAttribute('open','true');
    }
  }