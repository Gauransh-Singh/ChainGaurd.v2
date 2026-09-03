import copy
from typing import Any, Dict, List, Optional, Tuple
from backend.blockchain.block import Block
from backend.blockchain.hashing import calculate_sha256

GENESIS_PREV_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

class Blockchain:
    def __init__(self):
        self.chain: List[Block] = []
        self.clean_backup: Optional[List[Dict[str, Any]]] = None
        self.is_corrupted: bool = False
        self.corruption_details: Optional[Dict[str, Any]] = None
        self._init_genesis()

    def _init_genesis(self):
        genesis_block = Block.create(
            index=0,
            event_type="GENESIS",
            shipment_id="SYSTEM",
            actor="GENESIS_ORACLE",
            data={
                "message": "ChainGuard Cold-Chain Resilience & Verification Ledger Initialized",
                "consensus": "Proof-of-Authority-Simulated",
                "standard": "ISO-22301-Resilience-Compliant"
            },
            previous_hash=GENESIS_PREV_HASH
        )
        self.chain = [genesis_block]
        self._save_clean_state()

    def _save_clean_state(self):
        self.clean_backup = [b.model_dump() for b in self.chain]

    def add_block(self, event_type: str, shipment_id: str, actor: str, data: Dict[str, Any]) -> Block:
        # If currently corrupted, we do not append normally or we append to current top
        prev_hash = self.chain[-1].hash if self.chain else GENESIS_PREV_HASH
        new_index = len(self.chain)
        block = Block.create(
            index=new_index,
            event_type=event_type,
            shipment_id=shipment_id,
            actor=actor,
            data=data,
            previous_hash=prev_hash
        )
        self.chain.append(block)
        if not self.is_corrupted:
            self._save_clean_state()
        return block

    def validate_chain(self) -> Tuple[bool, Optional[Dict[str, Any]]]:
        if not self.chain:
            return False, {"error": "Empty chain"}

        for i, block in enumerate(self.chain):
            # 1. Check previous hash link
            if i == 0:
                if block.previous_hash != GENESIS_PREV_HASH:
                    details = {
                        "corrupted_block_index": 0,
                        "expected_prev_hash": GENESIS_PREV_HASH,
                        "actual_prev_hash": block.previous_hash,
                        "reason": "Genesis block invalid previous_hash"
                    }
                    self.is_corrupted = True
                    self.corruption_details = details
                    return False, details
            else:
                prev_block = self.chain[i - 1]
                if block.previous_hash != prev_block.hash:
                    details = {
                        "corrupted_block_index": i,
                        "expected_prev_hash": prev_block.hash,
                        "actual_prev_hash": block.previous_hash,
                        "reason": f"Broken chain link between block #{i-1} and #{i}"
                    }
                    self.is_corrupted = True
                    self.corruption_details = details
                    return False, details

            # 2. Recalculate hash from contents
            recalculated = calculate_sha256(
                index=block.index,
                timestamp=block.timestamp,
                event_type=block.event_type,
                shipment_id=block.shipment_id,
                actor=block.actor,
                data=block.data,
                previous_hash=block.previous_hash
            )
            if recalculated != block.hash:
                details = {
                    "corrupted_block_index": i,
                    "expected_hash": recalculated,
                    "actual_hash": block.hash,
                    "reason": f"Data integrity violation at block #{i}. Stored hash does not match payload."
                }
                self.is_corrupted = True
                self.corruption_details = details
                return False, details

        self.is_corrupted = False
        self.corruption_details = None
        return True, None

    def tamper_block(self, target_index: int, fake_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.clean_backup:
            self._save_clean_state()

        if target_index < 0 or target_index >= len(self.chain):
            target_index = max(0, len(self.chain) - 1)

        block = self.chain[target_index]
        # Mutate block data without updating hash
        original_data = copy.deepcopy(block.data)
        block.data.update(fake_data)

        # Run validation to detect mismatch
        valid, details = self.validate_chain()
        return {
            "tampered_block_index": target_index,
            "original_data": original_data,
            "tampered_data": block.data,
            "validation_result": valid,
            "details": details
        }

    def restore_chain(self) -> bool:
        if self.clean_backup:
            self.chain = [Block(**b) for b in self.clean_backup]
            self.is_corrupted = False
            self.corruption_details = None
            return True
        return False

    def get_ledger(self) -> List[Dict[str, Any]]:
        return [b.model_dump() for b in self.chain]
