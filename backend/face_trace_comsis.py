import cv2
import numpy as np
import face_recognition
from PIL import Image as PILImage, ImageOps
import os
from datetime import datetime
import requests
import argparse
import pickle
import json
import sys

class SimpleFacerec:
    """
    A refined Face Recognition class that:
      - Stores multiple encodings for each known person.
      - Augments training images by rotating and flipping them
        so side profiles can be recognized.
      - Detects multiple faces in real-time frames.
    """
    def __init__(self, encodings_file='encodings.pkl'):
        # File where we store face encodings
        self.encodings_file = encodings_file

        # In-memory lists for known faces
        self.known_face_encodings = []
        self.known_face_names = []
        self.known_face_categories = []
        self.known_face_info = {}

        # Resize factor for faster real-time inference
        self.frame_resizing = 0.25

        # Rotation angles for data augmentation (in degrees)
        self.rotation_angles = [-30, -15, 15, 30]

        # Attempt loading existing encodings
        self.load_encodings()

    def load_encodings(self):
        """
        Loads face encodings, names, categories, and info from encodings_file (if it exists).
        """
        if os.path.exists(self.encodings_file):
            with open(self.encodings_file, 'rb') as f:
                data = pickle.load(f)
                self.known_face_encodings = data.get('encodings', [])
                self.known_face_names = data.get('names', [])
                self.known_face_categories = data.get('categories', [])
                self.known_face_info = data.get('info', {})
            print(f"Loaded {len(self.known_face_encodings)} face encodings from {self.encodings_file}")
        else:
            print(f"No encodings file found at {self.encodings_file}. Starting with empty encodings.")

    def save_encodings(self):
        """
        Saves the current face encodings, names, categories, and info to encodings_file.
        """
        data = {
            'encodings': self.known_face_encodings,
            'names': self.known_face_names,
            'categories': self.known_face_categories,
            'info': self.known_face_info
        }
        with open(self.encodings_file, 'wb') as f:
            pickle.dump(data, f)
        print(f"Saved {len(self.known_face_encodings)} face encodings to {self.encodings_file}")

    def remove_encodings_for(self, label_to_remove):
        """
        Removes all face encodings (and associated metadata) for the given label (person's unique ID).
        """
        new_encodings, new_names, new_categories = [], [], []

        for encoding, name, category in zip(
            self.known_face_encodings,
            self.known_face_names,
            self.known_face_categories
        ):
            if name != label_to_remove:
                new_encodings.append(encoding)
                new_names.append(name)
                new_categories.append(category)

        self.known_face_encodings = new_encodings
        self.known_face_names = new_names
        self.known_face_categories = new_categories

        # Remove from known_face_info if present
        if label_to_remove in self.known_face_info:
            del self.known_face_info[label_to_remove]

        print(f"Removed encodings for label: {label_to_remove}")

    def load_encoding_image(self, img_path, name, category, info):
        """
        Loads an image from img_path, finds ALL face encodings, and stores them (plus augmentations).
        This allows training on multiple faces found in a single image (if needed),
        and on augmented variants (rotations + horizontal flip).

        :param img_path: path to the image file.
        :param name: label or unique ID of the person.
        :param category: e.g. 'student', 'faculty', 'worker'.
        :param info: additional info (dict) about the person.
        """
        if not os.path.exists(img_path):
            print(f"[Warning] Image path '{img_path}' does not exist. Skipping.")
            return

        try:
            img = PILImage.open(img_path).convert('RGB')
        except Exception as e:
            print(f"[Error] Could not open image {img_path}: {e}")
            return

        # We'll generate augmented images for improved recognition
        base_images = [img]

        # Rotate images by defined angles
        for angle in self.rotation_angles:
            rotated_img = img.rotate(angle, expand=True)
            base_images.append(rotated_img)

        # Horizontal flip
        flipped_img = ImageOps.mirror(img)
        base_images.append(flipped_img)

        # Capitalize category for storing
        category_cap = category.capitalize()

        # For each augmentation, detect ALL faces, store encodings
        for augmented_img in base_images:
            rgb_img = np.array(augmented_img)
            face_encodings = face_recognition.face_encodings(rgb_img)

            if len(face_encodings) == 0:
                # Possibly no face or face too small in this augmentation
                continue

            for face_encoding in face_encodings:
                self.known_face_encodings.append(face_encoding)
                self.known_face_names.append(name)
                self.known_face_categories.append(category_cap)
                self.known_face_info[name] = info

                print(f"Stored face encoding for '{name}' from '{img_path}' (augmented).")

    def detect_known_faces(self, frame, model='hog'):
        """
        Detects and recognizes multiple faces in a frame using face_recognition.
        :param frame: BGR image (numpy array from OpenCV).
        :param model: 'hog' or 'cnn' for face detection. ('cnn' is more accurate but requires GPU)
        :return: (face_locations, face_names, face_categories)
                 where face_locations are scaled back to the original frame size.
        """
        # Resize frame for faster processing
        small_frame = cv2.resize(frame, (0, 0), fx=self.frame_resizing, fy=self.frame_resizing)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

        # Detect faces
        face_locations = face_recognition.face_locations(rgb_small_frame, model=model)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

        face_names = []
        face_categories = []

        # Compare each detected face with known encodings
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
            name = "Unknown"
            category = "Outsider"

            face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
            if len(face_distances) > 0:
                best_match_index = np.argmin(face_distances)
                if matches and matches[best_match_index]:
                    name = self.known_face_names[best_match_index]
                    category = self.known_face_categories[best_match_index]

            face_names.append(name)
            face_categories.append(category)

        # Scale face locations back to original size
        face_locations = np.array(face_locations) / self.frame_resizing
        return face_locations.astype(int), face_names, face_categories

# -------------- Helper for parsing label -------------- #
def parse_label(label):
    """
    Example function: If your label is 'John_123', parse out 'John'.
    Adjust as needed for your naming format.
    """
    parts = label.split('_')
    if len(parts) >= 1:
        return parts[0]
    else:
        return label

# Global instance
sfr = SimpleFacerec()

def detect_bounding_box_and_recognize(vid_frame, sfr, prev_face_names):
    """
    Perform face detection & recognition on a single video frame,
    draw bounding boxes & text, and POST results to a server if a new face appears.
    """
    model = 'hog'  # 'cnn' if you want to use a GPU
    face_locations, face_names, face_categories = sfr.detect_known_faces(vid_frame, model=model)
    current_time = datetime.now()

    # e.g. 'John_123' => 'John'
    actual_face_names = [parse_label(name) for name in face_names]

    # Identify newly seen faces vs. previous frame
    new_faces = [name for name in actual_face_names if name not in prev_face_names]

    for (top, right, bottom, left), label, actual_name, category in zip(
            face_locations, face_names, actual_face_names, face_categories):

        # Decide bounding box color
        if category == "Outsider":
            box_color = (0, 0, 255)  # Red
        else:
            box_color = (0, 255, 0)  # Green

        cv2.rectangle(vid_frame, (left, top), (right, bottom), box_color, 2)
        cv2.rectangle(vid_frame, (left, bottom - 35), (right, bottom), box_color, cv2.FILLED)

        cv2.putText(vid_frame,
                    f"{actual_name} ({category})",
                    (left + 6, bottom - 6),
                    cv2.FONT_HERSHEY_DUPLEX,
                    1.0,
                    (255, 255, 255),
                    1)

        # If this face wasn't in the previous frame, POST to server
        if actual_name in new_faces:
            info = sfr.known_face_info.get(label, {})
            timestamp_str = current_time.strftime("%Y-%m-%d %H:%M:%S")

            if actual_name != "Unknown":
                # Build additional info from the stored dictionary
                cat_lc = category.lower()
                additionalInfo = {}
                if cat_lc == 'student':
                    additionalInfo["RegNo"] = info.get("RegNo") or info.get("regNumber")
                    additionalInfo["Department"] = info.get("Department") or info.get("department")
                elif cat_lc == 'faculty':
                    additionalInfo["FacultyId"] = info.get("FacultyId") or info.get("facultyId")
                    additionalInfo["Department"] = info.get("Department") or info.get("department")
                elif cat_lc == 'worker':
                    additionalInfo["WorkerId"] = info.get("WorkerId") or info.get("workerId")

                payload = {
                    "name": actual_name,
                    "category": cat_lc,
                    "timestamp": timestamp_str,
                    "additionalInfo": additionalInfo
                }
                print("Sending alert to server with payload:")
                print(json.dumps(payload, indent=4))

                # POST alert
                try:
                    resp = requests.post("https://13.53.130.198/alerts", json=payload)
                    print(f"Alerts POST status: {resp.status_code}, response: {resp.text}")
                    resp.raise_for_status()
                except requests.exceptions.RequestException as e:
                    print(f"[Error] Could not send alert: {e}")

                # If faculty, also handle attendance
                if cat_lc == 'faculty':
                    faculty_payload = {
                        "name": actual_name,
                        "timestamp": timestamp_str
                    }
                    print("Sending faculty attendance to server with payload:")
                    print(json.dumps(faculty_payload, indent=4))
                    try:
                        resp = requests.post("https://13.53.130.198/detect-faculty", json=faculty_payload)
                        print(f"Faculty POST status: {resp.status_code}, response: {resp.text}")
                        resp.raise_for_status()
                    except requests.exceptions.RequestException as e:
                        print(f"[Error] Could not send faculty attendance: {e}")

            else:
                # Unknown face logic
                timestamp_filename = current_time.strftime('%Y%m%d_%H%M%S')
                unknowns_dir = 'unknowns'
                if not os.path.exists(unknowns_dir):
                    os.makedirs(unknowns_dir)

                unknown_image_path = os.path.join(unknowns_dir, f'unknown_{timestamp_filename}.jpg')

                # Make sure ROI is valid
                top = max(0, top)
                right = min(vid_frame.shape[1], right)
                bottom = min(vid_frame.shape[0], bottom)
                left = max(0, left)

                unknown_face_image = vid_frame[top:bottom, left:right]
                cv2.imwrite(unknown_image_path, unknown_face_image)
                print(f"[Unknown] Saved face to {unknown_image_path}")

                # Convert Windows backslashes
                unknown_image_path = unknown_image_path.replace('\\', '/')
                if not unknown_image_path.startswith('/'):
                    unknown_image_path = '/' + unknown_image_path

                payload = {
                    "timestamp": timestamp_str,
                    "image_path": unknown_image_path
                }
                print("Sending unknown alert to server with payload:")
                print(json.dumps(payload, indent=4))
                try:
                    resp = requests.post("https://13.53.130.198/unknown-alert", json=payload)
                    print(f"Unknown POST status: {resp.status_code}, response: {resp.text}")
                    resp.raise_for_status()
                except requests.exceptions.RequestException as e:
                    print(f"[Error] Could not send unknown data: {e}")

    # Keep track of this frame's recognized names
    prev_face_names.clear()
    prev_face_names.extend(actual_face_names)

    return vid_frame


# ------------------- CLI ARGUMENTS & MAIN ------------------- #
parser = argparse.ArgumentParser(description="Face Recognition and Model Updating Script")
parser.add_argument('command', type=str, help="'update_model', 'recognize', or 'remove_encoding'")
parser.add_argument('imagePath', type=str, nargs='?', default=None, help="Path to the image for update_model")
parser.add_argument('label', type=str, nargs='?', default=None, help="Person's unique label or ID")
parser.add_argument('entityType', type=str, nargs='?', default=None, help="student/faculty/worker (for update_model)")
parser.add_argument('additionalInfo', type=str, nargs='?', default=None, help="JSON string (for update_model)")

args = parser.parse_args()

if args.command == 'update_model':
    # Usage:
    #   python face_trace_comsis.py update_model <imagePath> <label> <entityType> <additionalInfo>
    if not args.imagePath or not args.label or not args.entityType:
        print("[Error] Missing required arguments for 'update_model'.")
        print("Usage: python face_trace_comsis.py update_model <imagePath> <label> <entityType> <additionalInfo>")
        sys.exit(1)

    print(f"[Info] Updating model with image: {args.imagePath}")
    print(f"        Label: {args.label}")
    print(f"        Entity Type: {args.entityType}")
    print(f"        Additional Info: {args.additionalInfo}")

    try:
        additional_info = json.loads(args.additionalInfo) if args.additionalInfo else {}
    except json.JSONDecodeError:
        print("[Error] Invalid JSON format for additionalInfo.")
        sys.exit(1)

    # Load & augment the image -> produce encodings
    sfr.load_encoding_image(args.imagePath, args.label, args.entityType, additional_info)
    sfr.save_encodings()
    print("[Success] Model updated with new face encodings.")

elif args.command == 'recognize':
    # Usage:
    #   python face_trace_comsis.py recognize
    # Opens webcam, recognizes faces in real time.
    print("[Info] Starting real-time recognition. Press 'q' to exit.")
    video_capture = cv2.VideoCapture(0)
    prev_face_names = []

    if not video_capture.isOpened():
        print("[Error] Could not open webcam.")
        sys.exit(1)

    while True:
        ret, video_frame = video_capture.read()
        if not ret:
            print("[Error] Failed to grab frame from webcam.")
            break

        # Detect & recognize
        video_frame = detect_bounding_box_and_recognize(video_frame, sfr, prev_face_names)
        cv2.imshow('Video', video_frame)

        # Press 'q' to quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    video_capture.release()
    cv2.destroyAllWindows()
    print("[Info] Recognition session ended.")

elif args.command == 'remove_encoding':
    # Usage:
    #   python face_trace_comsis.py remove_encoding <label>
    if not args.label:
        print("[Error] Missing label for remove_encoding.")
        print("Usage: python face_trace_comsis.py remove_encoding <label>")
        sys.exit(1)

    print(f"[Info] Removing all encodings for label: {args.label}")
    sfr.load_encodings()
    sfr.remove_encodings_for(args.label)
    sfr.save_encodings()
    print(f"[Success] Removed all encodings for '{args.label}'.")

else:
    print("[Error] Invalid command. Use 'update_model', 'recognize', or 'remove_encoding'.")
    sys.exit(1)
