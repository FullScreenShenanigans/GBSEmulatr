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
        allocate;
        ccall;
        getValue;
    }

    export interface IGBSEmulatrSettings {
        ItemsHolder: ItemsHoldr.IItemsHoldr;
        Module: IModule;
        library: ILibrary;
        context?: AudioContext;
    }

    export interface IGBSEmulatr {

    }
}
