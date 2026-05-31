import cv2
import numpy as np
from typing import List, Dict, Any, Tuple
import logging
from PIL import Image
import os

from .config import settings

logger = logging.getLogger(__name__)


class ImageProcessor:
    @staticmethod
    def read_image(file_path: str) -> np.ndarray:
        img = cv2.imread(file_path)
        if img is None:
            raise ValueError(f"Cannot read image from {file_path}")
        return img

    @staticmethod
    def save_image(img: np.ndarray, file_path: str) -> bool:
        try:
            cv2.imwrite(file_path, img)
            return True
        except Exception as e:
            logger.error(f"Error saving image: {e}")
            return False

    @staticmethod
    def create_thumbnail(file_path: str, thumbnail_path: str, max_size: int = 300) -> bool:
        try:
            with Image.open(file_path) as img:
                img.thumbnail((max_size, max_size))
                img.save(thumbnail_path)
            return True
        except Exception as e:
            logger.error(f"Error creating thumbnail: {e}")
            return False

    @staticmethod
    def get_image_dimensions(file_path: str) -> Tuple[int, int]:
        try:
            with Image.open(file_path) as img:
                return img.size
        except Exception as e:
            logger.error(f"Error getting image dimensions: {e}")
            return 0, 0

    @staticmethod
    def detect_objects(image: np.ndarray) -> List[Dict[str, Any]]:
        results = []
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        height, width = image.shape[:2]
        min_area = (width * height) * 0.01
        
        for i, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            if area > min_area:
                x, y, w, h = cv2.boundingRect(contour)
                label = f"地物_{i}"
                aspect_ratio = w / h
                
                if aspect_ratio < 0.5:
                    label = "线状地物"
                elif aspect_ratio > 2:
                    label = "条状地物"
                elif area > (width * height) * 0.1:
                    label = "大面积区域"
                else:
                    label = "建筑物/植被"
                
                results.append({
                    "label": label,
                    "confidence": min(0.95, 0.5 + (area / (width * height)) * 0.5),
                    "bbox_x": float(x),
                    "bbox_y": float(y),
                    "bbox_width": float(w),
                    "bbox_height": float(h),
                    "area": float(area)
                })
        
        return results

    @staticmethod
    def detect_changes(image1_path: str, image2_path: str, output_mask_path: str) -> Dict[str, Any]:
        try:
            img1 = ImageProcessor.read_image(image1_path)
            img2 = ImageProcessor.read_image(image2_path)
            
            if img1.shape != img2.shape:
                img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))
            
            gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
            gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
            
            gray1 = cv2.GaussianBlur(gray1, (5, 5), 0)
            gray2 = cv2.GaussianBlur(gray2, (5, 5), 0)
            
            frame_diff = cv2.absdiff(gray1, gray2)
            
            _, thresh = cv2.threshold(frame_diff, 30, 255, cv2.THRESH_BINARY)
            
            kernel = np.ones((5, 5), np.uint8)
            thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
            thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
            
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            change_areas = []
            total_area = 0
            height, width = img1.shape[:2]
            image_area = height * width
            
            for i, contour in enumerate(contours):
                area = cv2.contourArea(contour)
                if area > image_area * 0.001:
                    x, y, w, h = cv2.boundingRect(contour)
                    change_areas.append({
                        "id": i,
                        "x": float(x),
                        "y": float(y),
                        "width": float(w),
                        "height": float(h),
                        "area": float(area)
                    })
                    total_area += area
            
            change_mask_color = cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)
            cv2.imwrite(output_mask_path, change_mask_color)
            
            change_percentage = (total_area / image_area) * 100
            
            return {
                "change_percentage": round(change_percentage, 2),
                "change_areas": change_areas,
                "total_change_area": float(total_area)
            }
            
        except Exception as e:
            logger.error(f"Error detecting changes: {e}")
            raise

    @staticmethod
    def enhance_image(image: np.ndarray) -> np.ndarray:
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        
        lab = cv2.merge((l, a, b))
        enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
        
        return enhanced

    @staticmethod
    def segment_image(image: np.ndarray) -> np.ndarray:
        pixel_values = image.reshape((-1, 3))
        pixel_values = np.float32(pixel_values)
        
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
        k = 5
        _, labels, centers = cv2.kmeans(pixel_values, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        centers = np.uint8(centers)
        segmented_image = centers[labels.flatten()]
        segmented_image = segmented_image.reshape(image.shape)
        
        return segmented_image


image_processor = ImageProcessor()
