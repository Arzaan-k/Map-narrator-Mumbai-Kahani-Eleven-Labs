import { useState, useCallback } from 'react';
import { gatherData, generateScript } from '../lib/api';

export function useStoryPipeline() {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState<string>('');
    const [storyData, setStoryData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const runPipeline = useCallback(async (location: any, preferences: any) => {
        setIsLoading(true);
        setError(null);
        setStoryData(null);

        try {
            setLoadingStep('Finding local whispers...');
            const gatheredData = await gatherData(location, preferences);

            // Step 2: Generate script
            setLoadingStep('Crafting your story...');
            const scriptData = await generateScript({
                scrapedContent: gatheredData.scrapedContent,
                pois: gatheredData.pois,
                areaInfo: gatheredData.areaInfo,
                preferences
            }, preferences); // Pass preferences inside body mostly, but API signature in hook calls might differ

            // Step 3: Prepare final data
            setLoadingStep('Preparing narrator...');

            const finalStoryData = {
                ...gatheredData,
                script: scriptData.script,
                knowledgeBase: gatheredData.scrapedContent,
                preferences,
            };

            setStoryData(finalStoryData);
            setIsLoading(false);
            return finalStoryData;
        } catch (err: any) {
            console.error('Pipeline error:', err);
            setError(err.message || 'The spirits were silent.');
            setIsLoading(false);
            throw err;
        }
    }, []);

    const reset = useCallback(() => {
        setIsLoading(false);
        setLoadingStep('');
        setStoryData(null);
        setError(null);
    }, []);

    return {
        runPipeline,
        isLoading,
        loadingStep,
        storyData,
        error,
        reset,
    };
}
