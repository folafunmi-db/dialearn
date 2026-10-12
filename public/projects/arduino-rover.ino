// Dialearn: UNO R3 + TB6612FNG. See the wiring table before powering.
// Lift driven wheels for the first test. Serial: f, b, l, r, s.
// Every movement command expires after 1 second; reset starts stopped.
const int STBY=4, PWMA=5, PWMB=6, AIN1=7, AIN2=8, BIN1=9, BIN2=10;
unsigned long started=0;
bool moving=false;
void drive(int left,int right){
  digitalWrite(AIN1,left>0); digitalWrite(AIN2,left<0);
  digitalWrite(BIN1,right>0); digitalWrite(BIN2,right<0);
  analogWrite(PWMA,abs(left)); analogWrite(PWMB,abs(right));
  moving=left!=0||right!=0; digitalWrite(STBY,moving?HIGH:LOW);
  started=millis();
}
void setup(){
  for(int pin=4;pin<=10;pin++)pinMode(pin,OUTPUT);
  drive(0,0); Serial.begin(9600);
  Serial.println("Ready: f b l r s. Movement stops after 1 second.");
}
void loop(){
  if(Serial.available()){
    char command=Serial.read();
    switch(command){
      case 'f': drive(100,100); break;
      case 'b': drive(-100,-100); break;
      case 'l': drive(-100,100); break;
      case 'r': drive(100,-100); break;
      case 's': drive(0,0); break;
    }
  }
  if(moving&&millis()-started>=1000)drive(0,0);
}
