#!/usr/bin/env python3
"""
바코드 패턴 생성기
13자리 바코드를 입력받아 패턴 이미지를 생성하는 프로그램
"""

import os
import sys
import datetime
import logging
import numpy as np
from PIL import Image
import shutil

# 로깅 설정
def setup_logging():
    """로그 파일 및 콘솔 출력 설정"""
    os.makedirs("logs", exist_ok=True)
    log_file = f"logs/pattern_generator_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file, encoding='utf-8'),
            logging.StreamHandler(sys.stdout)
        ]
    )
    return logging.getLogger(__name__)

class BarcodePatternGenerator:
    def __init__(self, pattern_dir=None):
        """
        바코드 패턴 생성기 초기화
        
        Args:
            pattern_dir: 패턴 이미지 파일들이 있는 디렉토리 경로
        """
        self.logger = setup_logging()
        project_root = os.path.dirname(os.path.abspath(__file__))
        if pattern_dir is None:
            candidate_dirs = [
                os.path.join(project_root, "mnt:project"),
                os.path.join(project_root, "patterns"),
                "/mnt/project",
            ]
            pattern_dir = next((d for d in candidate_dirs if os.path.isdir(d)), None)
        
        if not pattern_dir or not os.path.isdir(pattern_dir):
            raise FileNotFoundError(
                "패턴 디렉터리를 찾을 수 없습니다. --pattern-dir 경로를 확인하세요."
            )
        
        self.pattern_dir = pattern_dir
        self.patterns = {}
        self.load_patterns()
        
        # 출력 디렉토리 생성
        self.output_dir = "pattern_outputs"
        os.makedirs(self.output_dir, exist_ok=True)
        
        # 색상 팔레트 정의 (0-9: 컬러)
        self.colors = [
            (255, 0, 0),      # 0: 빨간색
            (255, 165, 0),    # 1: 주황색
            (255, 255, 0),    # 2: 노란색
            (0, 255, 0),      # 3: 초록색
            (0, 0, 255),      # 4: 파란색
            (75, 0, 130),     # 5: 남색
            (148, 0, 211),    # 6: 보라색
            (255, 192, 203),  # 7: 핑크색
            (165, 42, 42),    # 8: 갈색
            (128, 128, 128),  # 9: 회색
        ]
        
        self.color_names = [
            "빨간색", "주황색", "노란색", "초록색", "파란색",
            "남색", "보라색", "핑크색", "갈색", "회색"
        ]
    
    def load_patterns(self):
        """패턴 이미지 파일들을 메모리에 로드"""
        self.logger.info("패턴 이미지 로드 시작...")
        
        for row in range(10):
            for col in range(10):
                filenames = [
                    f"{row}{col}.png",
                    f"{row}-{col}.png",
                    f"({row},{col}).png",
                ]
                
                filepath = None
                for name in filenames:
                    candidate = os.path.join(self.pattern_dir, name)
                    if os.path.exists(candidate):
                        filepath = candidate
                        break
                
                if filepath:
                    try:
                        img = Image.open(filepath).convert('L')  # 흑백으로 변환
                        self.patterns[(row, col)] = img
                        self.logger.debug(f"패턴 로드 완료: {os.path.basename(filepath)}")
                    except Exception as e:
                        self.logger.error(f"패턴 로드 실패 {os.path.basename(filepath)}: {str(e)}")
                else:
                    self.logger.warning(
                        f"패턴 파일 없음: {[os.path.join(self.pattern_dir, name) for name in filenames]}"
                    )
        
        self.logger.info(f"총 {len(self.patterns)}개의 패턴 로드 완료")
    
    def parse_barcode(self, barcode):
        """
        13자리 바코드를 파싱하여 패턴 정보 추출
        
        Args:
            barcode: 13자리 바코드 문자열
            
        Returns:
            tuple: ([(행, 열, 회전각도), ...], 색상번호)
        """
        if len(barcode) != 13:
            raise ValueError(f"바코드는 13자리여야 합니다. 입력된 길이: {len(barcode)}")
        
        if not barcode.isdigit():
            raise ValueError("바코드는 숫자로만 구성되어야 합니다.")
        
        # 3자리씩 4개 그룹으로 분할
        groups = [barcode[i:i+3] for i in range(0, 12, 3)]
        
        patterns_info = []
        for group in groups:
            row = int(group[0])      # 첫 번째 숫자: 행 (기본 패턴)
            col = int(group[1])      # 두 번째 숫자: 열 (세부 변형)
            rotation = int(group[2])  # 세 번째 숫자: 회전 각도
            
            # 회전 각도 계산 (0-9 → 0°, 90°, 180°, 270°)
            rotation_angle = rotation * 90
            
            patterns_info.append((row, col, rotation_angle))
        
        # 마지막 1자리는 색상
        color = int(barcode[12])
        
        return patterns_info, color
    
    def rotate_pattern(self, image, angle):
        """
        패턴 이미지를 지정된 각도로 회전
        
        Args:
            image: PIL Image 객체
            angle: 회전 각도 (도)
            
        Returns:
            회전된 PIL Image 객체
        """
        # 회전 시 배경을 흰색으로 설정
        return image.rotate(-angle, fillcolor=255, expand=False)
    
    def hex_to_rgb(self, hex_str):
        """'#rrggbb' → (r,g,b)"""
        hex_str = hex_str.lstrip('#')
        if len(hex_str) != 6:
            raise ValueError(f"잘못된 hex 색상값: {hex_str}")
        r = int(hex_str[0:2], 16)
        g = int(hex_str[2:4], 16)
        b = int(hex_str[4:6], 16)
        return (r, g, b)

    def apply_color(self, image, color_index):
        """
        흑백 패턴에 색상 적용
        검은색 부분에만 지정된 색상을 적용
        
        Args:
            image: 흑백 PIL Image 객체
            color_index: 색상 인덱스 (0-9)
            
        Returns:
            색상이 적용된 PIL Image 객체
        """
        # 흑백 이미지를 numpy 배열로 변환
        img_array = np.array(image)
        
        # RGB 이미지 생성
        height, width = img_array.shape
        rgb_array = np.zeros((height, width, 3), dtype=np.uint8)
        
        # 선택된 색상
        color = self.colors[color_index]
        
        # 검은색 픽셀 (값이 낮은 픽셀)에 색상 적용
        # 흰색 픽셀은 그대로 흰색 유지
        for i in range(3):  # RGB 각 채널
            # 그레이스케일 값을 반전하여 검은색 부분에 색상 적용
            rgb_array[:, :, i] = np.where(
                img_array < 128,  # 검은색 부분 (임계값 128)
                color[i],          # 지정된 색상 적용
                255                # 흰색 부분은 흰색 유지
            )
        
        return Image.fromarray(rgb_array, 'RGB')
    
    def apply_color_rgb(self, image, rgb_color):
        """
        임의의 (r,g,b) 색으로 칠하는 버전 (사진에서 추출한 색 사용)
        """
        img_array = np.array(image)
        height, width = img_array.shape
        rgb_array = np.zeros((height, width, 3), dtype=np.uint8)

        for i in range(3):
            rgb_array[:, :, i] = np.where(
                img_array < 128,
                rgb_color[i],
                255
            )

        return Image.fromarray(rgb_array, 'RGB')

    def create_pattern_image(self, barcode, bottom_color_hex=None):
        """
        바코드를 기반으로 최종 패턴 이미지 생성
        1,2사분면: 바코드 마지막 자리 색
        3,4사분면: bottom_color_hex (예: '#aabbcc')
        
        Args:
            barcode: 13자리 바코드 문자열
            
        Returns:
            생성된 이미지 파일 경로
        """
        self.logger.info(f"패턴 생성 시작: {barcode}")
        
        # 바코드 파싱
        patterns_info, color_index = self.parse_barcode(barcode)
        self.logger.info(f"파싱 결과: 패턴={patterns_info}, 색상 index={color_index}")

        # 사진 색(hex)을 (r,g,b)로 변환
        bottom_rgb = None
        if bottom_color_hex is not None:
            bottom_rgb = self.hex_to_rgb(bottom_color_hex)
            self.logger.info(f"하단 색상(hex): {bottom_color_hex}, rgb={bottom_rgb}")

        # 개별 패턴 이미지 준비
        pattern_images = []
        
        for idx, (row, col, rotation) in enumerate(patterns_info, 1):
            # 패턴 가져오기
            if (row, col) not in self.patterns:
                self.logger.warning(f"패턴 {row}{col}.png을 찾을 수 없습니다. 기본 패턴 사용")
                # 기본 패턴으로 00.png 사용
                pattern_img = self.patterns.get((0, 0), None)
                if pattern_img is None:
                    # 빈 흰색 이미지 생성
                    pattern_img = Image.new('L', (256, 256), color=255)
            else:
                pattern_img = self.patterns[(row, col)].copy()
            
            # 회전 적용
            if rotation != 0:
                pattern_img = self.rotate_pattern(pattern_img, rotation)
                self.logger.debug(f"패턴 ①{idx}: {row}{col}.png, {rotation}도 회전")
            
            pattern_images.append(pattern_img)
        
        # 2x2 그리드로 배치 (각 패턴은 256x256 픽셀로 가정)
        pattern_size = pattern_images[0].size[0]
        grid_size = pattern_size * 2
        
        '''
        # 최종 이미지 생성 (2x2 그리드)
        final_image = Image.new('L', (grid_size, grid_size), color=255)
        # 패턴 배치 (①②③④)
        positions = [
            (0, 0),                      # ① 왼쪽 상단
            (pattern_size, 0),           # ② 오른쪽 상단
            (0, pattern_size),           # ③ 왼쪽 하단
            (pattern_size, pattern_size) # ④ 오른쪽 하단
        ]
        
        for img, pos in zip(pattern_images, positions):
            final_image.paste(img, pos)

        # 색상 적용
        final_colored = self.apply_color(final_image, color)

        # 파일 저장
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"pattern_{barcode}_{timestamp}.png"
        output_path = os.path.join(self.output_dir, output_filename)
        
        # 고품질로 저장
        final_colored.save(output_path, 'PNG', quality=100)
'''        
        # 최종 이미지는 처음부터 RGB로 생성
        final_rgb = Image.new('RGB', (grid_size, grid_size), color=(255, 255, 255))

        positions = [
            (0, 0),                      # idx 0 → 1사분면
            (pattern_size, 0),           # idx 1 → 2사분면
            (0, pattern_size),           # idx 2 → 3사분면
            (pattern_size, pattern_size) # idx 3 → 4사분면
        ]

        for idx, (base_img, pos) in enumerate(zip(pattern_images, positions)):
            if idx < 2:
                # 1,2 사분면: 바코드 팔레트 색
                colored = self.apply_color(base_img, color_index)
            else:
                # 3,4 사분면: 사진에서 추출한 색 (없으면 팔레트 색으로 fallback)
                if bottom_rgb is not None:
                    colored = self.apply_color_rgb(base_img, bottom_rgb)
                else:
                    colored = self.apply_color(base_img, color_index)

            final_rgb.paste(colored, pos)
        
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"pattern_{barcode}_{timestamp}.png"
        output_path = os.path.join(self.output_dir, output_filename)
        final_rgb.save(output_path, 'PNG', quality=100)

        self.logger.info(f"패턴 이미지 생성 완료: {output_path}")
        
        # info 텍스트도 두 색상 정보 적어주면 좋음
        info_path = output_path.replace('.png', '_info.txt')
        with open(info_path, 'w', encoding='utf-8') as f:
            f.write(f"바코드: {barcode}\n")
            f.write(f"생성 시간: {timestamp}\n")
            f.write(f"상단 색상 index: {color_index} ({self.color_names[color_index]})\n")
            f.write(f"상단 RGB: {self.colors[color_index]}\n")
            if bottom_rgb is not None:
                f.write(f"하단 색상 hex: {bottom_color_hex}\n")
                f.write(f"하단 RGB: {bottom_rgb}\n")
            f.write(f"\n패턴 구성:\n")
            for i, (row, col, rotation) in enumerate(patterns_info, 1):
                f.write(f"  패턴 {i}: {row}{col}.png, 회전 {rotation}도\n")

        return output_path
    
    def process_barcode_input(self):
        """대화형 바코드 입력 및 처리"""
        print("="*60)
        print("바코드 패턴 생성기 v1.0")
        print("="*60)
        print("13자리 바코드를 입력하면 패턴 이미지를 생성합니다.")
        print("종료하려면 'exit' 또는 'quit'를 입력하세요.")
        print("-"*60)
        
        while True:
            try:
                barcode = input("\n바코드 입력 (13자리): ").strip()
                
                if barcode.lower() in ['exit', 'quit']:
                    print("프로그램을 종료합니다.")
                    break
                
                if not barcode:
                    continue
                
                # 패턴 생성
                output_path = self.create_pattern_image(barcode)
                
                print(f"\n✅ 패턴 생성 성공!")
                print(f"   파일 위치: {output_path}")
                
                # 패턴 정보 출력
                patterns_info, color = self.parse_barcode(barcode)
                print(f"\n📊 패턴 정보:")
                print(f"   바코드: {barcode[:3]} {barcode[3:6]} {barcode[6:9]} {barcode[9:12]} {barcode[12]}")
                for idx, (row, col, rotation) in enumerate(patterns_info, 1):
                    print(f"   패턴 {idx}: {row}{col}.png (회전: {rotation}°)")
                print(f"   색상: {self.color_names[color]} (RGB: {self.colors[color]})")
                
            except ValueError as e:
                print(f"\n❌ 입력 오류: {str(e)}")
                print("   13자리 숫자를 정확히 입력해주세요.")
            except Exception as e:
                self.logger.error(f"처리 중 오류 발생: {str(e)}")
                print(f"\n❌ 오류 발생: {str(e)}")

def main():
    """메인 함수"""
    try:
        generator = BarcodePatternGenerator()
        generator.process_barcode_input()
    except KeyboardInterrupt:
        print("\n\n프로그램이 중단되었습니다.")
    except Exception as e:
        print(f"프로그램 실행 중 오류: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()