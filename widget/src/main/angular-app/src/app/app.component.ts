import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FluigService } from './services/fluig.service';
import {
  PoComboOption,
  PoDialogService,
  PoModalComponent,
  PoNotificationService,
  PoTableColumn,
  PoTagType
} from '@po-ui/ng-components';
import { EstabCentroCusto } from './interfaces/estabCentroCusto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

interface Processo {
  processInstanceId: number;
  active: boolean;
  // adicione outras propriedades conforme necessário
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  @ViewChild('modal') modal!: PoModalComponent;
  @ViewChild('modalPedidos') modalPedidos!: PoModalComponent;
  @ViewChild('modalReprocessa') modalReprocessa!: PoModalComponent;
  @ViewChild('modalProcessoFluig') modalProcessoFluig!: PoModalComponent;
  processoFinalizado: { processInstanceId: number; processDescription: string; status: string } | null = null;
  chaveNF: string = '';
  form!: FormGroup;
  targetProperty= 'pedido';
  bLoading: boolean = true;
  nTotalNotas: number = 0;
  showExtraFields: boolean = false;
  allFieldsDisabled: boolean = false;
  nProgressPercent: number = 0;
  showProgressBar: boolean = false;
  bFalse: boolean = false;
  showTotalNf: boolean = false;
  allFieldsDisabledInverse: boolean = false;
  bExportExcel: boolean = false;
  columns: Array<any> = new Array();
  public items: Array<any> = [];
  public itemsResponse: Array<any> = [];
  public allItems: Array<EstabCentroCusto> = [];
  totalExpanded: number = 0;
  public filialOptions: Array<PoComboOption> = [];
  public selectedFilial!: string;
  type: PoTagType = PoTagType.Success;
  cTotalTag: string = '';
  selectedNumPedido: string = '';
  isExportExecuted: boolean = false;
  modalData: any[] = [];
  modalDataAprovacao: any[] = [];
  modalDataReprocessa: any[] = [];
  modalProcessoFluigValue: string = '';
  processoFluigAtivo: any = null;
  loadingProcesso: boolean = false;

  abrirModalProcesso(processo: string): void {
    this.modalProcessoFluigValue = processo;
    this.loadingProcesso = true;
    this.processoFluigAtivo = null;
  
    this.fluigService.getProcessoAtivo(processo).subscribe({
      next: (res: any) => {
        const tarefa = res.items.find((item: any) => item.status === 'NOT_COMPLETED');
        if (tarefa) {
          this.processoFluigAtivo = {
            nomeResponsavel: tarefa.assignee?.name,
            slaStatus: tarefa.slaStatus,
            startDate: tarefa.startDate,
            assignStartDate: tarefa.assignStartDate,
            warningDate: tarefa.warningDate,
            processDescription: tarefa.processDescription,
            stateName: tarefa.state?.stateName // 👈 adiciona aqui!
          };
        } else {
          // não havia tarefa ativa → buscar histórico finalizado
          this.fluigService.getProcessoFinalizado(processo).subscribe({
            next: fin => {
              const proc = fin.items[0];
              if (proc) {

                let statusTrad: string;
                switch (proc.status) {
                  case 'FINALIZED':
                    statusTrad = 'FINALIZANDO';
                    break;
                  case 'CANCELED':
                    statusTrad = 'CANCELADO';
                    break;
                  default:
                    statusTrad = proc.status;
                }
                this.processoFinalizado = {
                  processInstanceId: proc.processInstanceId,
                  processDescription: proc.processDescription,
                  status: statusTrad
                };
              } else {
                this.poNotification.warning('Nenhum processo encontrado.');
              }
              this.loadingProcesso = false;
              this.modalProcessoFluig.open();
            },
            error: errFin => {
              this.poNotification.error('Erro ao buscar processo finalizado.');
              this.loadingProcesso = false;
            }
          });
        }
        this.loadingProcesso = false;
        this.modalProcessoFluig.open();
      },
      error: (err) => {
        this.poNotification.error('Erro ao buscar processo no Fluig.');
        this.loadingProcesso = false;
      }
    });
  }
  
  confirmarReprocessamento(notaId: string): void {
    this.chaveNF = this.form.get('cod-chave-acesso-nf')!.value;
    this.bLoading = true;
  
    this.fluigService.consultarProcessos(this.chaveNF)
      .pipe(finalize(() => this.bLoading = true))
      .subscribe(
        response => {
          const processoAtivo: Processo = response.items.find((item: Processo) => item.active === true);
  
          if (processoAtivo) {
            // Se existe processo ativo, exibe modal com aviso
            this.modalDataReprocessa = [{
              type: 'Aviso',
              code: 'Processo Ativo',
              description: `Já existe processo ativo de número ${processoAtivo.processInstanceId}.`,
              details: 'Não é permitido reprocessar este item.'
            }];
            this.modalReprocessa.open();
          } else {
            // Se não existe processo ativo, abre o PoDialog de confirmação
            this.poDialog.confirm({
              title: 'Reprocessamento',
              message: 'Nenhum processo ativo encontrado. Deseja confirmar o reprocessamento?',
              confirm: () => { 
                // O que acontece ao clicar em “Sim”
                this.nfReprocess(notaId);
              },
              cancel: () => {
                this.bLoading = true;
                // O que acontece ao clicar em “Cancelar”
                // Normalmente, não fazemos nada, somente fechar o modal
              }
            });
          }
        },
        error => {
          console.error("Erro ao consultar a API:", error);
        }
      );
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private fluigService: FluigService,
    private poNotification: PoNotificationService,
    private formBuilder: FormBuilder,
    private poDialog: PoDialogService
    
  ) {}

  ngOnInit() {
    this.getFilial();
    this.isExportExecuted = false;

    // Calcula o primeiro e o último dia do mês atual
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // Primeiro dia do mês
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // Último dia do mês

    // Formatar as datas no formato dd/mm/yyyy
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses são baseados em zero
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    };


    this.form = this.formBuilder.group({
      'cod-estabel-ini': ['101'],
      'cod-estabel-fim': ['101'],
      'data-ini': [formatDate(firstDayOfMonth)],
      'data-fim': [formatDate(lastDayOfMonth)],
      'nro-nota-ini': [''],
      'nro-nota-fim': ['ZZZZZZZZZZZZZ'],
      'serie-ini': [''],
      'serie-fim': ['ZZZ'],
      'cod-emitente-ini': [0],
      'cod-emitente-fim': [999999999],
      'nat-operacao-ini': [''],
      'nat-operacao-fim': ['ZZZZZZZZ'],
      'cod-chave-acesso-nf': ['015147777700000285700000000000000003G1BCXJ2'],
      // Inicialmente, se NÃO estiver em busca avançada, marca o campo "usa chave" como true:
      'l-usa-chave-acesso-nf': [true],
      'l-export-excel': [false],
    });

    this.columns = this.fluigService.getColumns();
  }

  parseDate(dateString: string): Date {
    const parts = dateString.split('/');
    return new Date(+parts[2], +parts[1] - 1, +parts[0]);
  }

  getFilial() {
    this.fluigService.getDataset('ds_zoom_estab_cnpj').subscribe({
      next: (res: any) => {
        this.filialOptions = res.content.values.map((filial: any) => ({
          value: filial.CODIGO,
          label: filial.CODIGO + ' - ' + filial.NOME + ' - ' + filial.CNPJ,
        }));
      },
      error: (err: any) => {
        this.poNotification.error(err.error.message)
        console.log(err);
      },
    });
  }


  exportToExcel() {
    this.bExportExcel = false;
    this.bLoading = false;
    this.fluigService.exportAsExcelFile(this.itemsResponse, 'nf_');
    this.bExportExcel = true;
    this.bLoading = true;
  }

  onSubmit() {
    if (this.form.valid) {
      
      this.showProgressBar = true;
      this.bLoading = false;
      this.showTotalNf = false;
      const formData = this.form.value;
      formData['cod-chave-acesso-nf'] = formData['cod-chave-acesso-nf'].replace(/\s+/g, '');
      this.nProgressPercent = 0;

      // this.fluigService.getDatasetnf(formData, 'ds_nf').subscribe(
      //   (response: any) => {
      //     //console.log(response);
      //     this.nTotalNotas = response.content.values.length;

      //     // Inicializando a barra de progresso
      //     this.nProgressPercent = 0;

      //     // Mapeando os dados vindos do JSON apenas com os campos que você quer
      //     this.items = [];
      //     this.itemsResponse = []
      //     response.content.values.forEach((item: any, index: number) => {
      //       setTimeout(() => {
      //         // Adicionando item ao array
      //         this.itemsResponse.push({
      //           erp_cod_estabel: item.erp_cod_estabel,
      //           erp_cod_emitente: item.erp_cod_emitente,
      //           desc_fornecedor: item.desc_fornecedor,
      //           erp_tp_dfe: item.erp_tp_dfe,
      //           erp_dt_trans: item.erp_dt_trans,
      //           ide_dEmi: item.ide_dEmi,
      //           ide_nNF: item.ide_nNF,
      //           total_vNF: item.total_vNF,
      //           biomassa: item.biomassa,
      //           numPedido: item.numPedido,
      //           cSitErp: item.cSitErp,
      //           id: item.id,
      //           details: [{
      //             id: item.id,
      //             ide_dEmi: item.ide_dEmi,
      //             numPedido: item.numPedido,
      //           }],
      //         });

      //         // Atualizando o progresso
      //         this.nProgressPercent = Math.round(
      //           ((index + 1) / this.nTotalNotas) * 100
      //         );

      //         // Forçando a detecção de mudanças
      //         //this.cdr.detectChanges(); // Forçando a atualização da interface

      //         // Log para depuração
      //         //console.log(`Progresso: ${this.nProgressPercent}%`);
      //         if (index === this.nTotalNotas - 1) {
      //           this.showProgressBar = false;
      //           this.showTotalNf = true;

      //           if (this.form.get('l-export-excel')?.value) {
      //             // Se estiver marcado, exporta para Excel e não exibe na tela
      //             this.exportToExcel();
      //             this.items = []; // Limpa os itens para não exibir na tela
      //           } else {
      //             // Se não estiver marcado, exibe os dados na tela
      //             this.items = this.itemsResponse;
      //             this.bExportExcel = true;
      //           }
      //         }
      //       }, 0); // O valor 0 permite que o Angular processe a mudança antes de continuar o loop
      //     });

      //     // Marcar para exportar Excel, se necessário
      //     this.bExportExcel = true;
      //     this.bLoading = true;
      //   },
      //   (error) => {
      //     console.error('Erro ao consumir a API', error);
      //     this.bLoading = true;
      //     this.showProgressBar = false;
      //   }
      // );

      this.fluigService.getDatasetnf1(formData).subscribe(
        (response: any) => {
          var responseNFs  = response.content.filter((r:any) => r.tipo == 1);
          var responseLogs = response.content.filter((r:any) => r.tipo == 2);

          this.nTotalNotas = responseNFs.length;
          this.cTotalTag = 'Total de NF: ' +  this.nTotalNotas
          // Inicializando a barra de progresso
          this.nProgressPercent = 0;

          // Mapeando os dados vindos do JSON apenas com os campos que você quer
          this.items = [];
          this.itemsResponse = [];

          responseNFs.forEach((item: any, index: number) => {

            setTimeout(() => {
              // Adicionando item ao array
              this.itemsResponse.push({
                erp_cod_estabel: item.erp_cod_estabel,
                erp_cod_emitente: item.erp_cod_emitente,
                desc_fornecedor: item.desc_fornecedor,
                erp_tp_dfe: item.erp_tp_dfe,
                erp_dt_trans: item.erp_dt_trans,
                ide_dEmi: item.ide_dEmi,
                ide_nNF: item.ide_nNF,
                total_vNF: item.total_vNF,
                biomassa: item.biomassa,
                numPedidoN: item.numPedido,
                cSitErp: item.cSitErp,
                id: item.id,
                pedido:  item,
                details: responseLogs.filter((r:any) => r.id == item.id),
                reprocessa:  item,
                processoFluig: this.getFluigProcessDetail(responseLogs.filter((r:any) => r.id == item.id))
              });

              // Atualizando o progresso
              this.nProgressPercent = Math.round(
                ((index + 1) / this.nTotalNotas) * 100
              );

              // Forçando a detecção de mudanças
              //this.cdr.detectChanges(); // Forçando a atualização da interface

              if (index === this.nTotalNotas - 1) {
                this.showProgressBar = false;
                this.showTotalNf = true;
                if (this.form.get('l-export-excel')?.value) {
                  // Se estiver marcado, exporta para Excel e não exibe na tela
                  this.exportToExcel();
                  this.items = []; // Limpa os itens para não exibir na tela
                } else {
                  // Se não estiver marcado, exibe os dados na tela
                  this.items = this.itemsResponse;
                  this.bExportExcel = true;
                }
              }

            }, 0); // O valor 0 permite que o Angular processe a mudança antes de continuar o loop
          });

          // Marcar para exportar Excel, se necessário
          this.bExportExcel = true;
          this.bLoading = true;

        },
        (error) => {
        //this.poNotification.error(error.error.message)
        this.poNotification.error('Range de Datas e Filiais estão muito longas.')
        console.error('Erro ao consumir a API', error);
        this.bLoading = true;
         this.showProgressBar = false;
        }
      );
    }


  }

openModal(pedido: string) {
  this.selectedNumPedido = pedido; // Atualiza o número do pedido selecionado
  this.fluigService.getPedidoDetails(pedido).subscribe({
    next: (response) => {
      if (response?.content?.values) {
        this.modalDataAprovacao = response.content.values.map((item: any) => ({
          desc_situacao: item.desc_situacao,
          nome_usuar: item.nome_usuar,
          dt_geracao: item.dt_geracao,
          dt_aprova: item.dt_aprova,
          valor_doc: item.valor_doc
        }));
        if (this.modal) this.modal.open(); // Abre o modal
      } else {
        this.poNotification.warning('Nenhum detalhe encontrado para este pedido.');
      }
    },
    error: (err) => {
      console.error('Erro ao consultar detalhes do pedido:', err);
      this.poNotification.error('Erro ao consultar os detalhes do pedido.');
    }
  });
}
openPedidoModal(filial: string, codigoFornecedor: string) {
  this.fluigService.getPedidoSaldo(filial, codigoFornecedor).subscribe({
    next: (response) => {
      if (response?.content?.values) {
        this.modalData = response.content.values.map((pedido: any) => ({
          NumPedido: pedido.NumPedido,
          CodEstabel: pedido.CodEstabel,
          NomeAbrev: pedido.NomeAbrev,
          ValorDoc: pedido.ValorDoc,
          ValorSaldo: pedido.ValorSaldo,
          detalhes: [], // Inicializa a lista de detalhes de aprovação vazia
        }));

        // Para cada pedido, busque os detalhes de aprovação
        this.modalData.forEach((pedido) => {
          this.fluigService.getPedidoDetails(pedido.NumPedido).subscribe({
            next: (detailResponse: any) => {
              if (detailResponse?.content?.values) {
                pedido.detalhes = detailResponse.content.values.map((detail: any) => ({
                  Situacao: detail.desc_situacao,
                  Usuario: detail.nome_usuar,
                  DataGeracao: detail.dt_geracao,
                  DataAprovacao: detail.dt_aprova,
                  ValorDoc: detail.valor_doc,
                }));
              }
            },
            error: (err) => {
              console.error(`Erro ao consultar detalhes do pedido ${pedido.NumPedido}:`, err);
              this.poNotification.error(`Erro ao consultar os detalhes do pedido ${pedido.NumPedido}.`);
            },
          });
        });

        this.modalPedidos.open(); // Abre o modal após iniciar as consultas
      } else {
        this.poNotification.warning('Nenhum pedido encontrado.');
      }
    },
    error: (err) => {
      console.error('Erro ao consultar pedidos:', err);
      this.poNotification.error('Erro ao consultar os pedidos.');
    },
  });
}

  toggleFields(isChecked: boolean) {
   // console.log(this.allFieldsDisabled);
    this.allFieldsDisabled = isChecked;
    this.allFieldsDisabledInverse = !isChecked;
  }
  onCollapseDetail() {
    this.totalExpanded -= 1;
    this.totalExpanded = this.totalExpanded < 0 ? 0 : this.totalExpanded;
  }

  nfReprocess(id: string) {
    this.bLoading = false;
    
    this.fluigService.reprocessarNota(id).subscribe({
      next: (response) => {
        if (response?.content?.values) {
          this.modalDataReprocessa = response.content.values.map((retReprocess: any) => ({
            type: retReprocess.type,
            code: retReprocess.code,
            description: retReprocess.description,
            details: retReprocess.details
          }));
          this.modalReprocessa.open();
          this.bLoading = true;
        } else {
          this.bLoading = true;
          this.poNotification.warning('Erro interno ao reprocessar NF!');
        }
      },
      error: (err) => {
        this.bLoading = true;
        console.error('Erro ao reprocessar NF:', err);
        this.poNotification.error('Erro ao reprocessar NF.');
      },
    });
  }


  getFluigProcessDetail(details: any[]): string | null {
    for (const log of details) {
      if (log.des_msg && log.des_msg.includes('Aberto processo no Fluig:')) {
        const parts = log.des_msg.split(':');
        if (parts.length > 1) {
          return parts[1].trim().replace(/\s/g, '');
        }
      }
    }
    return null;
  }
  abrirLinkFluig(processo: string): void {
    const url = `https://combioenergia.fluig.cloudtotvs.com.br/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=${processo}`;
    window.open(url, '_blank');
  }

  toggleAdvancedSearch(event: any): void {
    // Inverte o valor de showExtraFields
    this.showExtraFields = !this.showExtraFields;
  
    if (this.showExtraFields) {
      // Se a busca avançada foi ativada, marque "l-usa-chave-acesso-nf" como false para que apareçam os demais inputs.
      this.form.patchValue({ 'l-usa-chave-acesso-nf': false });
    } else {
      // Caso contrário, desativa a busca avançada e mantém "usa chave" marcado (true)
      this.form.patchValue({ 'l-usa-chave-acesso-nf': true });
    }
  }

}
