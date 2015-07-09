declare module GBSEmulatr {
    export interface ILibrary {
        [i: string]: ILibraryObject;
    }

    export interface ILibraryObject {
        gbs: string;
        gbsDecoded: number[];
        tracks: {
            [i: string]: number;
        };
    }

    export interface IDirectory {
        [i: string]: IDirectoryObject;
    }

    export interface IDirectoryObject {
        gbsSource: string;
        trackNum: number;
    }

    /**
     * Incomplete listing of ASM Module functionality. If there is a definition available
     * online, that would be nice.
     */
    export interface IModule {
        ALLOC_STATIC;
        allocate(slab: number, types: string, allocator: number, ptr?: any): number;
        ccall;
        getValue(ptr: number, type: string, noSafe?: boolean): number;
    }

    export interface IGBSEmulatrSettings {
        ItemsHolder: ItemsHoldr.IItemsHoldr;
        Module: IModule;
        library: ILibrary;
        context?: AudioContext;
    }

    export interface IGBSEmulatr {
        getLibrary(): ILibrary;
        getDirection(): IDirectory;
        getTheme(): string;
        getThemeNode(): ScriptProcessorNode;
        getContext(): AudioContext;
        getItemsHolder(): ItemsHoldr.IItemsHoldr;
        getModule(): IModule;
        getBufferSize(): number;
        getInt16Max(): number;
        getVolume(): number;
        getMuted(): number;
        stop(): void;
        clearAll(): void;
        setMutedOn(): void;
        setMutedOff(): void;
        toggleMuted(): void;
        play(track: string): void;
    }
}
