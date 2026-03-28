💳 Bank Transaction System <br/>

A backend project simulating real-world banking transactions using MongoDB transactions and ACID principles.

🚀 Key Features <br/>
Designed ACID-compliant transaction system using MongoDB sessions
Implemented double-entry ledger for strong data consistency
Handled concurrent transactions and prevented race conditions
Built idempotent APIs to avoid duplicate payments
🔄 Transaction Flow
A system account acts as the source of funds
Money flows:
System Account → User
User → Other Users

This approach ensures real-world banking behavior and avoids direct balance manipulation.


🛠️ Tech Stack <br/>
Node.js <br/>
Express.js <br/>
MongoDB (Transactions & Sessions)
