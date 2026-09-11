import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'QTI Components',
      description: 'Web components for rendering and running 1EdTech QTI 3.0 assessment items.',
      social: {
        github: 'https://github.com/Citolab/qti-components'
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'getting-started/introduction' },
            { label: 'Quick Start', slug: 'getting-started/quick-start' }
          ]
        },
        { label: 'CitoLab QTI Landscape', slug: 'qti-landscape' },
        {
          label: 'Guides',
          items: [
            { label: 'Authoring Response Processing', slug: 'guides/response-processing' },
            { label: 'Showing Feedback', slug: 'guides/feedback' }
          ]
        },
        {
          label: 'qti-test',
          items: [
            { label: 'Overview', slug: 'qti-test/overview' },
            { label: 'Structure', slug: 'qti-test/structure' },
            { label: 'Navigation', slug: 'qti-test/navigation' },
            { label: 'Scoring & State', slug: 'qti-test/scoring-and-state' },
            { label: 'View Helpers', slug: 'qti-test/view-helpers' }
          ]
        },
        {
          label: 'Interactions',
          items: [
            { label: 'Overview', slug: 'interactions/overview' },
            { label: 'Choice', slug: 'interactions/choice' },
            { label: 'Text Entry', slug: 'interactions/text-entry' },
            { label: 'Extended Text', slug: 'interactions/extended-text' },
            { label: 'Inline Choice', slug: 'interactions/inline-choice' },
            { label: 'Order', slug: 'interactions/order' },
            { label: 'Match', slug: 'interactions/match' },
            { label: 'Gap Match', slug: 'interactions/gap-match' },
            { label: 'Hottext', slug: 'interactions/hottext' },
            { label: 'Select Point', slug: 'interactions/select-point' },
            { label: 'Hotspot', slug: 'interactions/hotspot' },
            { label: 'Slider', slug: 'interactions/slider' },
            { label: 'Upload', slug: 'interactions/upload' },
            { label: 'Associate', slug: 'interactions/associate' },
            { label: 'Graphic Associate', slug: 'interactions/graphic-associate' },
            { label: 'Graphic Gap Match', slug: 'interactions/graphic-gap-match' },
            { label: 'Graphic Order', slug: 'interactions/graphic-order' },
            { label: 'Position Object', slug: 'interactions/position-object' },
            { label: 'Media', slug: 'interactions/media' },
            { label: 'Custom', slug: 'interactions/custom' },
            { label: 'Portable Custom', slug: 'interactions/portable-custom' },
            { label: 'End Attempt', slug: 'interactions/end-attempt' }
          ]
        },
        { label: 'Package Reference', slug: 'packages' }
      ]
    })
  ]
});
