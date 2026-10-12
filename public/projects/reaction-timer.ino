// UNO R3: D9 -> 220 ohm -> LED anode; LED cathode -> GND.
// D2 -> button -> GND, using electrically distinct contacts.
// Nonblocking teaching game; debounce adds delay. Hardware untested.
const byte ledPin = 9, buttonPin = 2;
enum Phase { READY, WAIT_LIGHT, MEASURE, RELEASE };
Phase phase = READY;
bool lastRaw = HIGH, stable = HIGH;
unsigned long rawChanged = 0, waitStarted = 0, waitDuration = 0, lightStarted = 0;
void setup() {
  pinMode(ledPin, OUTPUT); digitalWrite(ledPin, LOW);
  pinMode(buttonPin, INPUT_PULLUP); Serial.begin(9600);
  Serial.println("Press and release to start. Wait for the light!");
}
void loop() {
  const unsigned long now = millis();
  const bool raw = digitalRead(buttonPin);
  if (raw != lastRaw) { rawChanged = now; lastRaw = raw; }
  bool pressed = false;
  if (now - rawChanged >= 25 && raw != stable) {
    stable = raw; pressed = (stable == LOW);
  }
  if (phase == RELEASE && stable == HIGH) {
    phase = READY; Serial.println("Press to start another round.");
  }
  if (pressed) {
    if (phase == READY) {
      waitStarted = now; waitDuration = random(1500, 4500);
      phase = WAIT_LIGHT; Serial.println("Wait...");
    } else if (phase == WAIT_LIGHT) {
      Serial.println("Too soon! Release to try again."); phase = RELEASE;
    } else if (phase == MEASURE) {
      digitalWrite(ledPin, LOW);
      Serial.print("Game time (includes debounce delay): ");
      Serial.print(now - lightStarted); Serial.println(" ms"); phase = RELEASE;
    }
  }
  if (phase == WAIT_LIGHT && now - waitStarted >= waitDuration) {
    digitalWrite(ledPin, HIGH); lightStarted = now; phase = MEASURE;
  }
  if (phase == MEASURE && now - lightStarted >= 10000) {
    digitalWrite(ledPin, LOW); Serial.println("Round timed out."); phase = RELEASE;
  }
}
