import React, { useMemo, useRef, useCallback, forwardRef, useImperativeHandle, ReactNode } from 'react';
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

type BottomSheetProps = {
    children: ReactNode;
};

const BottomSheet = forwardRef<any, BottomSheetProps>(({ children }, ref) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    // Adjusted snap points to give a bit more breathing room
    const snapPoints = useMemo(() => ['30%', '55%', '90%'], []);

    useImperativeHandle(ref, () => {
        const modal = bottomSheetModalRef.current;
        return {
            present: () => modal?.present(),
            dismiss: () => modal?.dismiss(),
            snapToIndex: (index: number) => modal?.snapToIndex(index),
            snapToPosition: (position: string | number, animationConfigs?: any) => modal?.snapToPosition(position, animationConfigs),
            expand: () => modal?.expand(),
            collapse: () => modal?.collapse(),
            close: () => modal?.close(),
            forceClose: () => modal?.forceClose(),
        };
    });

    const handleSheetChanges = useCallback((index: number) => {
        // console.log('handleSheetChanges', index);
    }, []);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                opacity={0.6} // Softer, premium backdrop
                appearsOnIndex={0}
                disappearsOnIndex={-1}
            />
        ),
        []
    );

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            onChange={handleSheetChanges}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            // Premium Bottom Sheet Styling applied globally here
            backgroundStyle={{
                borderRadius: 32,
                backgroundColor: '#ffffff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 10,
            }}
            handleIndicatorStyle={{
                backgroundColor: '#e5e7eb', // Soft gray handle
                width: 48,
                height: 6,
                borderRadius: 4,
            }}
        >
            {/* Removed the forced center alignment so children govern their own layout */}
            <BottomSheetView style={{ flex: 1, paddingBottom: 20 }}>
                {children}
            </BottomSheetView>
        </BottomSheetModal>
    );
});

export default BottomSheet;