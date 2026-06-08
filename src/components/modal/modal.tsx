"use client";

import { JSX } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { ElementSize } from "@/types";
import { defaultModalStyle, MediumModalStyle } from "@/constants";

interface ModalComponentProps {
  title: string;
  children: string | JSX.Element;
  isOpen: boolean;
  size?: ElementSize;
}

const ModalComponent = ({
  title,
  children,
  isOpen,
  size = "small",
}: ModalComponentProps) => {
  const modalSize =
    size === "small"
      ? defaultModalStyle
      : size === "medium"
        ? MediumModalStyle
        : {};

  return (
    <Modal open={isOpen} aria-labelledby="modal-modal-title">
      <Box sx={modalSize}>
        <Typography id="modal-modal-title" variant="h4" component="h2">
          {title}
        </Typography>
        <Box sx={{ mt: 2 }}>{children}</Box>
      </Box>
    </Modal>
  );
};

export default ModalComponent;
