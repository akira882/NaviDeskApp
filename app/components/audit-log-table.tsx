"use client";

import { Badge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/table";
import { useContent } from "@/components/content-provider";
import { userRepository } from "@/data/repositories/content-repository";
import { formatDate } from "@/lib/utils";

export function AuditLogTable() {
  const { auditLogs } = useContent();
  const users = userRepository.listUsers();

  return (
    <Table>
      <thead className="bg-slate-50">
        <tr>
          <Th>日時</Th>
          <Th>実行者</Th>
          <Th>操作</Th>
          <Th>対象</Th>
          <Th>詳細</Th>
        </tr>
      </thead>
      <tbody>
        {auditLogs.map((log) => (
          <tr key={log.id}>
            <Td>{formatDate(log.timestamp)}</Td>
            <Td>{users.find((user) => user.id === log.actorId)?.name ?? "不明"}</Td>
            <Td><Badge>{log.action}</Badge></Td>
            <Td>{`${log.targetType} / ${log.targetId}`}</Td>
            <Td>{log.detail}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
