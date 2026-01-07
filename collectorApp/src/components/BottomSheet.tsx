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
    const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

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

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                opacity={0.7}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
            />
        ),
        []
    );

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
        >
            <BottomSheetView className='flex-1 p-4 justify-center items-center'>
                {children}
            </BottomSheetView>
        </BottomSheetModal>
    );
});

export default BottomSheet;