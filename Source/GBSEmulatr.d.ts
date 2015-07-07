declare module GBSEmulatr {
    export interface ILibrary {

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
        library: ILibrary;
        context?: AudioContext;
    }

    export interface IGBSEmulatr {

    }
}
