import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Network, Sparkles, Filter, X } from 'lucide-react';
import { api } from '../services/api.js';
import { Button } from '../components/common/Button.js';
import { Spinner } from '../components/common/Spinner.js';

export const KnowledgeGraphPage: React.FC = () => {
  const { id: investigationId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['graph', investigationId],
    queryFn: () => api.knowledgeGraph.get(investigationId!),
    enabled: Boolean(investigationId)
  });

  const generateMutation = useMutation({
    mutationFn: () => api.knowledgeGraph.generate(investigationId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graph', investigationId] });
    }
  });

  const graphData = data?.data || { entities: [], relationships: [] };

  // Map backend entities to React Flow nodes
  const nodes: Node[] = useMemo(() => {
    return (graphData.entities || []).map((entity: any, index: number) => {
      const angle = (index / (graphData.entities.length || 1)) * 2 * Math.PI;
      const radius = 220;
      const x = 350 + radius * Math.cos(angle);
      const y = 250 + radius * Math.sin(angle);

      const colorMap: Record<string, string> = {
        research_question: '#2563eb', // blue
        publication: '#059669', // green
        author: '#d97706', // amber
        research_theme: '#7c3aed', // purple
        claim: '#0284c7', // cyan
        method: '#475569', // slate
        research_gap: '#dc2626', // red
        concept: '#db2777' // pink
      };

      return {
        id: entity.id,
        position: { x, y },
        data: {
          label: (
            <div className="text-left font-sans">
              <span className="text-[9px] uppercase font-bold tracking-wider opacity-75 block">
                {entity.entity_type.replace('_', ' ')}
              </span>
              <span className="text-xs font-semibold line-clamp-2">
                {entity.name}
              </span>
            </div>
          ),
          raw: entity
        },
        style: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
          border: `2px solid ${colorMap[entity.entity_type] || '#cbd5e1'}`,
          borderRadius: '10px',
          padding: '8px 12px',
          width: 170,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
        }
      };
    });
  }, [graphData.entities]);

  // Map backend relationships to React Flow edges
  const edges: Edge[] = useMemo(() => {
    return (graphData.relationships || []).map((rel: any, idx: number) => ({
      id: rel.id || `e-${idx}`,
      source: rel.source_entity_id,
      target: rel.target_entity_id,
      label: rel.relationship_type.replace('_', ' '),
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#64748b'
      },
      style: { stroke: '#94a3b8', strokeWidth: 1.5 },
      labelStyle: { fill: '#475569', fontSize: 10, fontWeight: 500 }
    }));
  }, [graphData.relationships]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data.raw);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Interactive Knowledge Graph</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize relationships between research inquiries, publications, methods, claims, and gaps.
          </p>
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          loading={generateMutation.isPending}
          size="sm"
          icon={<Sparkles size={14} />}
        >
          Regenerate Evidence Map
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner /></div>
      ) : nodes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <Network size={36} className="mx-auto text-slate-400 mb-2" />
          <h4 className="text-sm font-semibold text-slate-800">No Knowledge Graph Synthesized</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Build a visual entity-relationship network from the collected claims and sources.
          </p>
          <Button onClick={() => generateMutation.mutate()} size="sm">
            Generate Knowledge Graph
          </Button>
        </div>
      ) : (
        <div className="relative h-[600px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            fitView
          >
            <Background color="#334155" gap={16} />
            <Controls className="bg-white rounded-lg shadow-md border border-slate-200" />
            <MiniMap nodeColor="#0284c7" maskColor="rgba(15, 23, 42, 0.7)" />
          </ReactFlow>

          {/* Node detail side panel */}
          {selectedNode && (
            <div className="absolute top-4 right-4 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-5 z-20 animate-in fade-in slide-in-from-right-4 duration-200 max-h-[90%] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] uppercase font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                  {selectedNode.entity_type}
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X size={16} />
                </button>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-3">{selectedNode.name}</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {selectedNode.description || 'No additional entity description.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

