<script setup lang="ts">
import { DescData, Message, Button, Empty } from "@arco-design/web-vue";
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import axios from "axios";
import moment from "moment";
import Bus from "@/bus";
import { Spin, Card, CardGrid, CardMeta, Pagination, Descriptions, Popconfirm } from "@arco-design/web-vue";
import { IconShareInternal, IconDelete } from "@arco-design/web-vue/es/icon";
import config from "@/config";

enum HttpStatus {
  OK = 200,
}

const chartData = reactive<any>({
  chartList: [] as Array<{
    title: string;
    image: string;
    id: string;
    desc: DescData[];
  }>,
  total: 0,
  pageIndex: 1,
  loading: false,
  type: "",
  searchValue: "",
  componentType: "",
});

const convertTime = (timeStr: string) => {
  return moment(timeStr).format("YYYY-MM-DD");
};

const getData = () => {
  chartData.loading = true;
  Bus.$emit("search-loading", true);
  const params: any = {
    pageSize: 20,
    pageNo: chartData.pageIndex,
    type: chartData.type,
    componentType: chartData.componentType,
    name: chartData.searchValue,
  };
  if (chartData.type) {
    params.type = chartData.type;
  }
  axios
    .get(`${config.axiosBase}/component/list`, { params })
    .then((res) => {
      const { code, data, msg } = res.data;
      if (code === HttpStatus.OK) {
        const { list, total } = data;
        chartData.total = total;
        chartData.chartList = list.map((item: any) => {
          const { id, createTime, componentTypeMsg, name, typeMsg, image } = item;
          return {
            id,
            title: name,
            image,
            desc: [
              { value: convertTime(createTime), label: "创建时间" },
              { value: componentTypeMsg, label: "组件类型" },
              { value: typeMsg, label: "类型" },
            ],
          };
        });
      } else {
        Message.error(msg || "服务器开小差了，请稍后再试...");
      }
    })
    .finally(() => {
      chartData.loading = false;
      Bus.$emit("search-loading", false);
    });
};

onMounted(() => {
  Bus.$on("search", (res: any) => {
    Object.keys(res).forEach((key) => {
      chartData[key] = res[key];
    });
    chartData.pageIndex = 1;
    getData();
  });
});
onBeforeUnmount(() => {
  Bus.$off("search-loading");
});

const chartClick = async (params: string) => {
  const res = await axios.get(`${config.axiosBase}/component/detail?id=${params}`);
  const { template, componentType, type, id, name } = res?.data?.data;
  window.open(`${config.playground}/?id=${id}&name=${name}&componentType=${componentType}&type=${type}#${template}`);
};

const pageChange = (pageIndex: number) => {
  chartData.pageIndex = pageIndex;
  getData();
};

const openTab = async (params: string) => {
  const res = await axios.get(`${config.axiosBase}/component/detail?id=${params}`);
  const { template, componentType, type, id, name } = res?.data?.data;

  const url = `${config.playground}/?id=${id}&name=${name}&componentType=${componentType}&type=${type}#${template}`;

  const tempInput = document.createElement("textarea");

  tempInput.style.position = "absolute"; // 确保它不影响布局
  tempInput.style.opacity = "0"; // 隐藏文本区域
  document.body.append(tempInput);

  // 设置要复制的文本
  tempInput.value = url;
  tempInput.select(); // 选中文本

  // 执行复制命令
  try {
    document.execCommand("copy");
  } catch (error) {
    console.error("Error copying text:", error);
  }

  // 删除临时文本区域
  tempInput.remove();
  Message.success("分享链接已复制到剪贴板");
};

const handleAdd = () => {
  window.open(`${config.playground}?type=${chartData.type}&componentType=${chartData.componentType}`);
};

const handleRemove = async (id: string) => {
  try {
    const {
      data: { code, msg },
    } = await axios.post(`${config.axiosBase}/component/remove?id=${id}`);
    if (code !== HttpStatus.OK) return Message.error(msg);
    Message.success(msg);
    getData();
  } catch (error) {
    return Message.error(error as any);
  }
};
</script>

<template>
  <div class="w-full !h-full flex flex-col gap-8px overflow-hidden">
    <div class="ml-auto">
      <Button type="primary" @click="handleAdd"> 新增 </Button>
    </div>
    <Spin class="flex-1 overflow-auto" :loading="chartData.loading" tip="加载中，请稍后...">
      <Card :bordered="false">
        <CardGrid
          v-for="(item, index) in chartData.chartList"
          class="chart-card"
          :key="index"
          :style="{
            width: `${config.isMobileApp ? 'calc(100% - 16px)' : 'calc(20% - 16px)'}`,
          }"
        >
          <Card class="w-full p-10px box-border" :title="item.title || '-'" hoverable>
            <template #extra>
              <div class="flex items-center gap-5 justify-center">
                <IconShareInternal size="20" @click="openTab(item.id)" />
                <Popconfirm content="确定要删除吗?" @before-ok="handleRemove(item.id)">
                  <IconDelete size="20" />
                </Popconfirm>
              </div>
            </template>
            <template #cover>
              <div class="h-175px w-full" @click="chartClick(item.id)">
                <img :src="item.image" class="w-full h-full object-cover" v-if="item.image" />
                <Empty v-else class="w-full h-full flex justify-center items-center flex-col" description="暂无图片" />
              </div>
            </template>
            <CardMeta>
              <template #description>
                <Descriptions :data="item.desc" layout="inline-vertical" :column="3" @click="chartClick(item.id)" />
              </template>
            </CardMeta>
          </Card>
        </CardGrid>
      </Card>
    </Spin>
    <div class="pagination mt-15px">
      <Pagination
        :total="chartData.total"
        show-total
        @change="pageChange"
        :disabled="chartData.loading"
        :page-size="20"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pagination {
  display: flex;
  justify-content: end;
}
:deep(.arco-card) {
  background: transparent;
}

:deep(.arco-card-body) {
  box-sizing: border-box;
  margin: 0 !important;
  padding: 0 2px 0 0 !important;
  width: 100%;
  gap: 16px;
}

.arco-card-grid {
  box-shadow: unset !important;
}

::-webkit-scrollbar {
  display: none;
}

.chart-card {
  background: var(--color-bg-2);
  cursor: pointer;
}
</style>

