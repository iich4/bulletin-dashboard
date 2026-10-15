#!/bin/bash
# Fast video generation — title cards as PNGs + screenshots → video segments → concat
set -e

FRAMES="/tmp/frames"
TMP="/tmp/video-tmp"
OUT="/home/z/my-project/public/PERKESO_Bulletin_Dashboard_Presentation.mp4"
W=1280; H=720; FPS=30

rm -f "$TMP"/*.mp4

echo "=== Converting title cards to video ==="
for card in card-intro card-features card-ai card-outro; do
  case $card in
    card-intro) dur=5;;
    card-features) dur=3;;
    card-ai) dur=3;;
    card-outro) dur=6;;
  esac
  fout=$(awk "BEGIN{print $dur-0.4}")
  ffmpeg -y -loop 1 -i "$TMP/$card.png" -t $dur \
    -vf "fade=t=in:st=0:d=0.4,fade=t=out:st=$fout:d=0.4,format=yuv420p" \
    -c:v libx264 -preset ultrafast -r $FPS "$TMP/v-$card.mp4" 2>/dev/null
  echo "  ✓ $card ($dur s)"
done

echo "=== Converting screenshots to video segments ==="
declare -A DURS=(
  ["01-dashboard"]=5 ["02-charts"]=4 ["03-announcements"]=4
  ["04-acts"]=4 ["05-asip"]=4 ["06-sop"]=4
  ["07-circulars"]=4 ["08-faq"]=4 ["09-chatbot"]=5 ["10-darkmode"]=5
)
for key in 01-dashboard 02-charts 03-announcements 04-acts 05-asip 06-sop 07-circulars 08-faq 09-chatbot 10-darkmode; do
  dur=${DURS[$key]}
  fout=$(awk "BEGIN{print $dur-0.4}")
  ffmpeg -y -loop 1 -i "$FRAMES/$key.png" -t $dur \
    -vf "scale=$W:$H:force_original_aspect_ratio=decrease,pad=$W:$H:(ow-iw)/2:(oh-ih)/2:color=0x002147,fade=t=in:st=0:d=0.4,fade=t=out:st=$fout:d=0.4,format=yuv420p" \
    -c:v libx264 -preset ultrafast -r $FPS "$TMP/v-$key.mp4" 2>/dev/null
  echo "  ✓ $key ($dur s)"
done

echo "=== Concatenating ==="
cat > "$TMP/concat.txt" <<EOF
file '$TMP/v-card-intro.mp4'
file '$TMP/v-01-dashboard.mp4'
file '$TMP/v-02-charts.mp4'
file '$TMP/v-card-features.mp4'
file '$TMP/v-03-announcements.mp4'
file '$TMP/v-04-acts.mp4'
file '$TMP/v-05-asip.mp4'
file '$TMP/v-06-sop.mp4'
file '$TMP/v-07-circulars.mp4'
file '$TMP/v-08-faq.mp4'
file '$TMP/v-card-ai.mp4'
file '$TMP/v-09-chatbot.mp4'
file '$TMP/v-10-darkmode.mp4'
file '$TMP/v-card-outro.mp4'
EOF

ffmpeg -y -f concat -safe 0 -i "$TMP/concat.txt" \
  -c:v libx264 -preset ultrafast -pix_fmt yuv420p -r $FPS \
  "$TMP/video-noaudio.mp4" 2>/dev/null
echo "  ✓ concatenated"

echo "=== Adding background music ==="
ffmpeg -y \
  -f lavfi -i "sine=frequency=220:duration=60:sample_rate=44100,volume=0.12,afade=t=in:st=0:d=2,afade=t=out:st=57:d=3" \
  -f lavfi -i "sine=frequency=330:duration=60:sample_rate=44100,volume=0.06,afade=t=in:st=0:d=2,afade=t=out:st=57:d=3" \
  -filter_complex "[0:a][1:a]amix=inputs=2:duration=longest" \
  -c:a aac -b:a 128k "$TMP/bgm.aac" 2>/dev/null

ffmpeg -y -i "$TMP/video-noaudio.mp4" -i "$TMP/bgm.aac" \
  -c:v copy -c:a aac -b:a 128k -shortest "$OUT" 2>/dev/null

echo ""
echo "=== RESULT ==="
ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height "$OUT" 2>&1
ls -lh "$OUT"
