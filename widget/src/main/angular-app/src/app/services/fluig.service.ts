import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { PoTableColumn, PoTableDetail, PoTagType } from '@po-ui/ng-components';

@Injectable()
export class FluigService {

body?: Object = {}
httpOptions: any;

      constructor(
        private http: HttpClient,
      ) { this.httpOptions = environment.development ? {
        headers: new HttpHeaders({
          'Authorization': 'Bearer eyJraWQiOiI1OGM3NjQzZi03NTQwLTQ4Y2YtOGVhYy01NDhiM2I4MGYxOTMiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJyYWZhZWwuYXJhdWpvIiwicm9sZSI6InVzZXIsYWRtaW4iLCJ0ZW5hbnQiOjEsInVzZXJUZW5hbnRJZCI6NDQ3LCJzaXRlQ29kZSI6IkZsdWlnIiwic2l0ZUlkIjoxLCJ1c2VyVHlwZSI6MCwidXNlclVVSUQiOiJjNWViZmI2Yy0xZDA2LTQyNDMtYjMxZi1iZTkwOGJlNjY5NjciLCJ0ZW5hbnRVVUlEIjoiNThjNzY0M2YtNzU0MC00OGNmLThlYWMtNTQ4YjNiODBmMTkzIiwibGFzdFVwZGF0ZURhdGUiOjE3Mzk0NDg0ODgwMDAsInVzZXJUaW1lWm9uZSI6IkFtZXJpY2EvU2FvX1BhdWxvIiwiZXhwIjoxNzQ0MDUwNTkwLCJpYXQiOjE3NDQwNDkzOTAsImF1ZCI6ImZsdWlnX2F1dGhlbnRpY2F0b3JfcmVzb3VyY2UifQ.hHdSSZbdG6YsTPp9HpC9MUjNTLpeL_WU-wnl17Bc-7LMKlUDAHufPz0TO-FKfFU5LJAaeWMzGQ6r042dfZB8wJVKAqks1UgzFrWQVMJsmKxsXcpHqmvzU2k_SEIdDXCISEUcL6FyVhu_OKSyipiZkgbXYQ3ngTu7-p0pFgBOxCJwkqIj5wy3xfdDeQuYS6Y56xOEpe1z_BUgIWALa022-pvG-Fu9IIR86iwt1uNV1ZmPHBQJRCFhC_u-tYsXMFXTLTLW9B_NLjo1CckW7X9yLbV-1x1tzW_sJehIrxZhTKmtSOCbMxjZyaEks4bny3ul6f_i75mkyzCcZUImkPHPZg',
        })
      } : undefined; }


  public getDataset(dataset: string, filial?:string, dataIni?: Date, dataFim?: Date): Observable<any> {
        const url = '/api/public/ecm/dataset/datasets/';

        if (dataset == 'ds_estabelecimento'){
          this.body = {
            "name": dataset,
            "constraints": [],
        }

        } else {
          this.body = {
            "name": dataset,
            "constraints": [
                {
                    "_field": "unidade",
                    "_initialValue":  `[\"${filial}"\]`,
                    "_finalValue": "unidade",
                    "_type": 1
                },
                {
                    "_field": "dataIni",
                    "_initialValue": dataIni,
                    "_finalValue": "dataIni",
                    "_type": 1
                },
                {
                    "_field": "dataFim",
                    "_initialValue": dataFim,
                    "_finalValue": "dataFim",
                    "_type": 1
                }
            ],
        }
        }

        return this.http.post(url, this.body, this.httpOptions);
      }


      public getDatasetnf(receivedObject: any, dataset: string): Observable<any> {
        //const url = '/api/public/ecm/dataset/datasets/'; // A URL da API para enviar os dados
        const url = 'assets/resultado.json';
        this.body = {
          "name": dataset,
          "constraints": [
            {
              "_field": "cod-estabel-ini",
              "_initialValue": receivedObject['cod-estabel-ini'],
              "_finalValue": "cod-estabel-ini",
              "_type": 1
            },
            {
              "_field": "cod-estabel-fim",
              "_initialValue": receivedObject['cod-estabel-fim'],
              "_finalValue": "cod-estabel-fim",
              "_type": 1
            },
            {
              "_field": "data-ini",
              "_initialValue": receivedObject['data-ini'],
              "_finalValue": "data-ini",
              "_type": 1
            },
            {
              "_field": "data-fim",
              "_initialValue": receivedObject['data-fim'],
              "_finalValue": "data-fim",
              "_type": 1
            },
            {
              "_field": "nro-nota-ini",
              "_initialValue": receivedObject['nro-nota-ini'] || '',
              "_finalValue": "nro-nota-ini",
              "_type": 1
            },
            {
              "_field": "nro-nota-fim",
              "_initialValue": receivedObject['nro-nota-fim'] || '',
              "_finalValue": "nro-nota-fim",
              "_type": 1
            },
            {
              "_field": "serie-ini",
              "_initialValue": receivedObject['serie-ini'] || '',
              "_finalValue": "serie-ini",
              "_type": 1
            },
            {
              "_field": "serie-fim",
              "_initialValue": receivedObject['serie-fim'] || '',
              "_finalValue": "serie-fim",
              "_type": 1
            },
            {
              "_field": "cod-emitente-ini",
              "_initialValue": receivedObject['cod-emitente-ini'].toString(),
              "_finalValue": "cod-emitente-ini",
              "_type": 1
            },
            {
              "_field": "cod-emitente-fim",
              "_initialValue": receivedObject['cod-emitente-fim'].toString(),
              "_finalValue": "cod-emitente-fim",
              "_type": 1
            },
            {
              "_field": "nat-operacao-ini",
              "_initialValue": receivedObject['nat-operacao-ini'] || '',
              "_finalValue": "nat-operacao-ini",
              "_type": 1
            },
            {
              "_field": "nat-operacao-fim",
              "_initialValue": receivedObject['nat-operacao-fim'] || '',
              "_finalValue": "nat-operacao-fim",
              "_type": 1
            },
            {
              "_field": "cod-chave-acesso-nf",
              "_initialValue": receivedObject['cod-chave-acesso-nf'],
              "_finalValue": "cod-chave-acesso-nf",
              "_type": 1
            },
            {
              "_field": "l-usa-chave-acesso-nf",
              "_initialValue": receivedObject['l-usa-chave-acesso-nf'] ? 'true' : 'false',
              "_finalValue": "l-usa-chave-acesso-nf",
              "_type": 1
            }
          ]
        };

        //console.log(this.body); // Verifica o body no console

        // Retorna o resultado da requisição POST com os dados
        return this.http.get(url, this.body);
        //return this.http.post(url, this.body, this.httpOptions);
      }

      public getDatasetnf1(receivedObject: any): Observable<any> {
        // Monta a URL com os parâmetros
        const datasetId = 'ds_consulta_nf';
        const baseUrl = `/api/public/ecm/dataset/search?datasetId=${datasetId}&filterFields=`;

        // Parâmetros de filtro de consulta com base no objeto recebido
        const filterFields = [
          'estab_inicio', receivedObject['cod-estabel-ini'],
          'estab_fim', receivedObject['cod-estabel-fim'],
          'data_inicio', receivedObject['data-ini'],
          'data_fim', receivedObject['data-fim'],
          'nota_inicio', receivedObject['nro-nota-ini'] || '',
          'nota_fim', receivedObject['nro-nota-fim'] || 'ZZZZZZZZZZZZZ',
          'serie_inicio', receivedObject['serie-ini'] || '',
          'serie_fim', receivedObject['serie-fim'] || 'ZZZ',
          'emitente_inicio', receivedObject['cod-emitente-ini'].toString(),
          'emitente_fim', receivedObject['cod-emitente-fim'].toString(),
          'natureza_op_inicio', receivedObject['nat-operacao-ini'] || '',
          'natureza_op_fim', receivedObject['nat-operacao-fim'] || 'ZZZZZZZZ',
          'chave_nf', receivedObject['cod-chave-acesso-nf'],
          'usando_chave_nf', receivedObject['l-usa-chave-acesso-nf'] ? 'true' : 'false'
        ].join(',');

        const url = `${baseUrl}${filterFields}`;

        // Cabeçalhos, incluindo autorização e cookies

        // Faz a requisição GET para a API usando o HttpClient
        return this.http.get(url, this.httpOptions );
      }

      exportAsExcelFile(json: any[], excelFileName: string): void {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, excelFileName);
      }

      private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
        saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
      }


      getColumns(): Array<PoTableColumn> {
        const airfareDetail: PoTableDetail = {
          columns: [
            { property: 'dt_log', label: 'Data' },
            { property: 'hr_log', label: 'Hora' },
            { property: 'usuario', label: 'Usuário' },
            { property: 'cod_msg', label: 'Cód.' },
            { property: 'des_msg', label: 'Mensagem' }
            // Exibe o número do pedido
          ],
          typeHeader: 'top',
        };

        return [
          { property: 'erp_cod_estabel', label: 'Estab.' },
          { property: 'erp_cod_emitente', label: 'Cod.Forn.' },
          { property: 'desc_fornecedor', label: 'Nome', width: '18%' },
          { property: 'erp_tp_dfe', label: 'Tipo' },
          { property: 'ide_nNF', label: 'Num. NF' },
          { property: 'total_vNF', label: 'Valor NF' },
          { property: 'biomassa', label: 'Biomassa' },
          { property: 'id', label: 'Chave de Acesso', width: '18%' },
          { property: 'ide_dEmi', label: 'Data Emissão', width: '7%'  },
          { property: 'cSitErp', label: 'Situação ERP', width: '8%' },
          { property: 'pedido', label: 'Pedido Fornecedor', type: 'columnTemplate', width: '7%'  },
          { property: 'reprocessa', label: 'Reprocessar', type: 'columnTemplate', width: '10%' },
          {
            property: 'processoFluig',
            label: 'Fluig',
            type: 'columnTemplate',
            width: '15%'
          },
          {
            property: 'details',
            label: 'Detalhes',
            type: 'detail',
            detail: airfareDetail,
          }
        ];
      }

      public getPedidoDetails(pedido: string): Observable<any> {
        const url = '/api/public/ecm/dataset/datasets';
        const payload = {
          name: 'ds_verifica_aprovacao_pedidos_datasul',
          constraints: [
            {
              _field: 'pedido',
              _initialValue: pedido,
              _finalValue: pedido,
              _type: 1,
              _likeSearch: false,
              fieldName: 'pedido'
            }
          ]
        };

        return this.http.post(url, payload, this.httpOptions);
      }

      public getPedidoSaldo(filial: string, codigoFornecedor: string): Observable<any> {
        const url = '/api/public/ecm/dataset/datasets'; // URL da API
        const payload = {
          name: '_dsGetPedidoSaldo_aux',
          constraints: [
            {
              _field: 'codigo_fornecedor',
              _initialValue: codigoFornecedor,
              _finalValue: codigoFornecedor,
              _type: 1,
              _likeSearch: false,
              fieldName: 'codigo_fornecedor',
            },
            {
              _field: 'estabelecimento',
              _initialValue: filial,
              _finalValue: filial,
              _type: 1,
              _likeSearch: false,
              fieldName: 'estabelecimento',
            },
          ],
        };
        return this.http.post(url, payload, this.httpOptions);
      }

      public reprocessarNota(id: string): Observable<any> {
        const url = '/api/public/ecm/dataset/datasets';
        const payload = {
          name: 'ds_reprocessa_nf',
          constraints: [
            {
              _field: 'id',
              _initialValue: id,
              _finalValue: id,
              _type: 1,
              _likeSearch: false,
              fieldName: 'id'
            }
          ]
        };

        return this.http.post(url, payload, this.httpOptions);
      }

      public getProcessoAtivo(processInstanceId: string): Observable<any> {
        const url = `/process-management/api/v2/processes/recebimento_facil_wf/requests/tasks?expand=taskInfo&processInstanceId=${processInstanceId}`;
        return this.http.get(url, this.httpOptions);
      }

}


const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
