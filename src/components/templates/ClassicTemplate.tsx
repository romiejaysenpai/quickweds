'use client';

import type { TemplateProps } from '@/types/wedding';
import DynamicClassicTemplate from './variations/ClassicVariations';

export default function ClassicTemplate(props: TemplateProps) {
    return <DynamicClassicTemplate {...props} />;
}

