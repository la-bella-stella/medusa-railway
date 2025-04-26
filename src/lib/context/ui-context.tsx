"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";

export interface State {
  displayModal: boolean;
  displayGallery: boolean;
  modalView: string;
  modalData: any;
  toastText: string;
  isSidebarOpen: boolean;
  sidebarView: string;
  sidebarData: any;
}

const initialState: State = {
  displayModal: false,
  displayGallery: false,
  modalView: "LOGIN_VIEW",
  modalData: null,
  toastText: "",
  isSidebarOpen: false,
  sidebarView: "",
  sidebarData: null,
};

type Action =
  | { type: "OPEN_MODAL" }
  | { type: "CLOSE_MODAL" }
  | { type: "SET_MODAL_VIEW"; view: MODAL_VIEWS }
  | { type: "SET_MODAL_DATA"; data: any }
  | { type: "SET_TOAST_TEXT"; text: ToastText }
  | { type: "SET_USER_AVATAR"; value: string }
  | { type: "OPEN_GALLERY" }
  | { type: "CLOSE_GALLERY" }
  | { type: "OPEN_SIDEBAR"; view: DRAWER_VIEWS; data?: any }
  | { type: "CLOSE_SIDEBAR" };

type MODAL_VIEWS =
  | "SIGN_UP_VIEW"
  | "LOGIN_VIEW"
  | "FORGET_PASSWORD"
  | "PRODUCT_VIEW"
  | "ADDRESS_FORM_VIEW"
  | "ADDRESS_DELETE_VIEW"
  | "ADD_OR_UPDATE_CHECKOUT_CONTACT"
  | "ADD_OR_UPDATE_PROFILE_CONTACT"
  | "ADD_NEW_CARD"
  | "USE_NEW_PAYMENT"
  | "PAYMENT_MODAL"
  | "GATEWAY_MODAL"
  | "ADD_OR_UPDATE_GUEST_ADDRESS"
  | "SELECT_PRODUCT_VARIATION"
  | "DELETE_CARD_MODAL"
  | "WISHLIST_MODAL"
  | "GALLERY_VIEW"
  | "NEWSLETTER_MODAL"
  | "PROMO_POPUP_MODAL";

type DRAWER_VIEWS = "DISPLAY_FILTER" | "CART_SIDEBAR" | "MOBILE_MENU";

type ToastText = string;

export const UIContext = createContext<
  | (State & {
      openSidebar: (options: { view: DRAWER_VIEWS; data?: any }) => void;
      closeSidebar: () => void;
      openModal: () => void;
      closeModal: () => void;
      setModalView: (view: MODAL_VIEWS) => void;
      setModalData: (data: any) => void;
      openGallery: () => void;
      closeGallery: () => void;
    })
  | undefined
>(undefined);

UIContext.displayName = "UIContext";

function uiReducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN_SIDEBAR": {
      return {
        ...state,
        isSidebarOpen: true,
        sidebarView: action.view,
        sidebarData: action.data || null,
      };
    }
    case "CLOSE_SIDEBAR": {
      return {
        ...state,
        isSidebarOpen: false,
        sidebarView: "",
        sidebarData: null,
      };
    }
    case "OPEN_MODAL": {
      return {
        ...state,
        displayModal: true,
        isSidebarOpen: false,
      };
    }
    case "CLOSE_MODAL": {
      return {
        ...state,
        displayModal: false,
      };
    }
    case "SET_MODAL_VIEW": {
      return {
        ...state,
        modalView: action.view,
      };
    }
    case "SET_MODAL_DATA": {
      return {
        ...state,
        modalData: action.data,
      };
    }
    case "SET_TOAST_TEXT": {
      return {
        ...state,
        toastText: action.text,
      };
    }
    case "OPEN_GALLERY": {
      return {
        ...state,
        displayGallery: true,
      };
    }
    case "CLOSE_GALLERY": {
      return {
        ...state,
        displayGallery: false,
        sidebarView: "",
      };
    }
    default:
      return state;
  }
}

export const UIProvider: React.FC<{ children?: ReactNode }> = (props) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const openSidebar = ({ view, data }: { view: DRAWER_VIEWS; data?: any }) =>
    dispatch({ type: "OPEN_SIDEBAR", view, data });

  const closeSidebar = () => dispatch({ type: "CLOSE_SIDEBAR" });

  const openModal = () => dispatch({ type: "OPEN_MODAL" });
  const closeModal = () => dispatch({ type: "CLOSE_MODAL" });

  const setModalView = (view: MODAL_VIEWS) =>
    dispatch({ type: "SET_MODAL_VIEW", view });

  const setModalData = (data: any) => dispatch({ type: "SET_MODAL_DATA", data });

  const openGallery = () => dispatch({ type: "OPEN_GALLERY" });
  const closeGallery = () => dispatch({ type: "CLOSE_GALLERY" });

  const value = React.useMemo(
    () => ({
      ...state,
      openSidebar,
      closeSidebar,
      openModal,
      closeModal,
      setModalView,
      setModalData,
      openGallery,
      closeGallery,
    }),
    [state]
  );

  return <UIContext.Provider value={value} {...props} />;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error(`useUI must be used within a UIProvider`);
  }
  return context;
};