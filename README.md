💳 Bank Transaction System <br/>

A backend project simulating real-world banking transactions using MongoDB transactions and ACID principles.

🚀 Key Features <br/>
Designed ACID-compliant transaction system using MongoDB sessions  <br/>
Implemented double-entry ledger for strong data consistency  <br/>
Handled concurrent transactions and prevented race conditions  <br/>
Built idempotent APIs to avoid duplicate payments  <br/>

 
🔄 Transaction Flow  <br/>
A system account acts as the source of funds  <br/>
Money flows:  <br/>
System Account → User  <br/>
User → Other Users  <br/>

This approach ensures real-world banking behavior and avoids direct balance manipulation.  <br/>


🛠️ Tech Stack <br/>
Node.js <br/>
Express.js <br/>
MongoDB (Transactions & Sessions) <br/>
Jwt <br/>
