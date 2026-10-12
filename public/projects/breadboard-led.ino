// UNO R3: D9 -> 220 ohm resistor -> LED anode; LED cathode -> GND.
// Check connections with USB disconnected. Educational starter, hardware untested.
const byte ledPin = 9;
void setup() { pinMode(ledPin, OUTPUT); }
void loop() {
  digitalWrite(ledPin, HIGH); delay(1000);
  digitalWrite(ledPin, LOW); delay(1000);
}
