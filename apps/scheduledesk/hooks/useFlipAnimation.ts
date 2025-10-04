import { useRef, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

// Register the Flip plugin
gsap.registerPlugin(Flip);

interface FlipOptions {
  duration?: number;
  ease?: string;
  onComplete?: () => void;
  onInterrupt?: () => void;
}

interface FlipState {
  state: any;
  timestamp: number;
}

export const useFlipAnimation = () => {
  const currentAnimationRef = useRef<gsap.core.Timeline | null>(null);
  const flipStateRef = useRef<FlipState | null>(null);
  const isAnimatingRef = useRef<boolean>(false);

  // Capture the current state of specified elements
  const captureState = useCallback((selector: string | Element[]): FlipState | null => {
    try {
      const elements = typeof selector === 'string'
        ? Array.from(document.querySelectorAll(selector))
        : selector;

      if (elements.length === 0) {
        console.warn('FlipAnimation: No elements found for capture');
        return null;
      }

      const state = Flip.getState(elements, {
        props: "transform,opacity",
        simple: true
      });

      const flipState: FlipState = {
        state,
        timestamp: Date.now()
      };

      flipStateRef.current = flipState;
      return flipState;
    } catch (error) {
      console.error('FlipAnimation: Error capturing state', error);
      return null;
    }
  }, []);

  // Animate from captured state to current DOM positions
  const animateFromState = useCallback((
    capturedState: FlipState | null,
    options: FlipOptions = {}
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Cancel any existing animation
      if (currentAnimationRef.current) {
        currentAnimationRef.current.kill();
        options.onInterrupt?.();
      }

      if (!capturedState) {
        resolve();
        return;
      }

      try {
        isAnimatingRef.current = true;

        const timeline = Flip.from(capturedState.state, {
          duration: options.duration || 0.35,
          ease: options.ease || "power2.out",
          onComplete: () => {
            isAnimatingRef.current = false;
            currentAnimationRef.current = null;
            options.onComplete?.();
            resolve();
          },
          onInterrupt: () => {
            isAnimatingRef.current = false;
            currentAnimationRef.current = null;
            options.onInterrupt?.();
            resolve();
          }
        });

        currentAnimationRef.current = timeline;
      } catch (error) {
        isAnimatingRef.current = false;
        console.error('FlipAnimation: Error during animation', error);
        reject(error);
      }
    });
  }, []);

  // Combined capture and animate function for convenience
  const flipAnimate = useCallback(async (
    selector: string | Element[],
    stateUpdateFn: () => void | Promise<void>,
    options: FlipOptions = {}
  ): Promise<void> => {
    try {
      // Capture state before changes
      const capturedState = captureState(selector);

      // Apply state changes (React updates)
      await stateUpdateFn();

      // Wait for React to render changes - use double RAF for reliability
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve(void 0));
        });
      });

      // Only animate if we actually captured elements
      if (capturedState && capturedState.state) {
        await animateFromState(capturedState, options);
      }
    } catch (error) {
      console.error('FlipAnimation: Error in flipAnimate', error);
      // Don't throw - just log and continue
    }
  }, [captureState, animateFromState]);

  // Cancel current animation
  const cancelAnimation = useCallback(() => {
    if (currentAnimationRef.current) {
      currentAnimationRef.current.kill();
      currentAnimationRef.current = null;
      isAnimatingRef.current = false;
    }
  }, []);

  // Check if currently animating
  const isAnimating = useCallback(() => {
    return isAnimatingRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimation();
    };
  }, [cancelAnimation]);

  return {
    captureState,
    animateFromState,
    flipAnimate,
    cancelAnimation,
    isAnimating
  };
};

export default useFlipAnimation;
